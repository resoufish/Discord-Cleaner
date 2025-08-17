import { useCallback, useEffect, useState } from "react";
import type { ChannelPermissions, DiscordChannel, DiscordUser } from "./types";
import { UserProfileManager, type UserProfile } from "./components/UserProfileManager";
import { CleanupProgress, type LogEntry, type CleanupProgress as ProgressType } from "./components/CleanupProgress";
import { DiscordApiService } from "./lib";
import { toast } from "sonner";
import { CleanupSettings, type CleanupConfig } from "./components/CleanupSettings";
import { TokenSetup } from "./components/TokenSetup";
import { ServerSidebar } from "./components/ServerSidebar";
import { motion } from "motion/react";
import { Activity, Settings, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";


interface Server {
  id: string;
  name: string;
  icon?: string;
  categories: Category[];
  uncategorizedChannels: Channel[];
  isLoadingChannels?: boolean;
  channelsLoaded?: boolean;
  userPermissions?: string;
}

interface Category {
  id: string;
  name: string;
  position: number;
  channels: Channel[];
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'news' | 'thread' | 'stage' | 'forum' | 'dm' | 'group-dm';
  messageCount?: number;
  permissions?: ChannelPermissions;
  nsfw?: boolean;
  recipients?: DiscordUser[];
}

interface DMChannelInfo {
  id: string;
  name: string;
  avatar?: string;
  type: 'dm' | 'group-dm';
  recipients: DiscordUser[];
}

const STORAGE_KEYS = {
  PROFILES: 'discord-cleaner-profiles',
  CURRENT_PROFILE: 'discord-cleaner-current-profile',
  LAST_SETTINGS: 'discord-cleaner-last-settings'
};

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [discordApi, setDiscordApi] = useState<DiscordApiService | null>(null);
  const [currentUser, setCurrentUser] = useState<DiscordUser | null>(null);

  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>('settings');

  const [servers, setServers] = useState<Server[]>([]);
  const [dmChannels, setDmChannels] = useState<DMChannelInfo[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const [isLoadingDMs, setIsLoadingDMs] = useState(false);

  const [cleanupProgress, setCleanupProgress] = useState<ProgressType>({
    total: 0,
    processed: 0,
    deleted: 0,
    errors: 0,
    isRunning: false,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const loadProfiles = () => {
      try {
        const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
        const currentProfileId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);

        if (savedProfiles) {
          const parsedProfiles: UserProfile[] = JSON.parse(savedProfiles).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            lastUsed: new Date(p.lastUsed)
          }));

          setProfiles(parsedProfiles);

          if (currentProfileId && !currentProfile) {
            const profile = parsedProfiles.find(p => p.id === currentProfileId);
            if (profile) {
              handleProfileSelect(profile);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load profiles:', error);
        toast.error('Ошибка загрузки профилей');
      }
    };

    loadProfiles();
  }, [currentProfile]);

  const saveProfiles = useCallback((newProfiles: UserProfile[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(newProfiles));
    } catch (error) {
      console.error('Failed to save profiles:', error);
      toast.error('Ошибка сохранения профилей');
    }
  }, []);

  const handleProfileAdd = async (name: string, token: string): Promise<void> => {
    const profileId = `profile-${Date.now()}`;

    try {
      const api = new DiscordApiService(token);
      const user = await api.getCurrentUser();

      const newProfile: UserProfile = {
        id: profileId,
        name,
        token,
        discordUser: user,
        createdAt: new Date(),
        lastUsed: new Date(),
        isFavorite: false,
        isActive: false
      };

      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      saveProfiles(updatedProfiles);

      toast.success(`Профиль "${name}" успешно добавлен`);
    } catch (error) {
      console.error('Failed to add profile:', error);
      throw new Error('Не удалось добавить профиль. Проверьте токен.');
    }
  };

  const handleProfileRemove = (profileId: string) => {
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);

    if (currentProfile?.id === profileId) {
      setCurrentProfile(null);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROFILE);
      resetAppState();
    }

    toast.success('Профиль удален');
  };

  const handleProfileUpdate = (profileId: string, updates: Partial<UserProfile>) => {
    const updatedProfiles = profiles.map(p =>
      p.id === profileId ? { ...p, ...updates } : p
    );
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);

    if (currentProfile?.id === profileId) {
      setCurrentProfile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleProfileSelect = async (profile: UserProfile) => {
    if (profile.id === currentProfile?.id) return;

    setIsValidatingToken(true);
    setTokenError('');

    try {
      const api = new DiscordApiService(profile.token);
      const user = await api.getCurrentUser();

      const updatedProfile = {
        ...profile,
        discordUser: user,
        lastUsed: new Date(),
        isActive: true
      };

      const updatedProfiles = profiles.map(p => ({
        ...p,
        isActive: p.id === profile.id,
        ...(p.id === profile.id ? {
          lastUsed: new Date(),
          discordUser: user
        } : {})
      }));

      setProfiles(updatedProfiles);
      saveProfiles(updatedProfiles);

      setCurrentProfile(updatedProfile);
      setCurrentUser(user);
      setDiscordApi(api);
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, profile.id);

      resetAppState();

      toast.success(`Переключено на профиль "${profile.name}"`);

      await Promise.all([
        loadServers(api, user),
        loadDMChannels(api, user)
      ]);

    } catch (error) {
      console.error('Profile selection error:', error);
      setTokenError('Не удалось подключиться с этим профилем. Проверьте токен.');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleProfileSwipe = (direction: 'left' | 'right') => {
    if (profiles.length <= 1) return;

    const currentIndex = profiles.findIndex(p => p.id === currentProfile?.id);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'right') {
      nextIndex = (currentIndex + 1) % profiles.length;
    } else {
      nextIndex = currentIndex === 0 ? profiles.length - 1 : currentIndex - 1;
    }

    handleProfileSelect(profiles[nextIndex]);
  };

  const handleTokenSubmit = async (token: string) => {
    setIsValidatingToken(true);
    setTokenError('');

    try {
      const api = new DiscordApiService(token);
      const user = await api.getCurrentUser();

      const profileId = `profile-${Date.now()}`;
      const newProfile: UserProfile = {
        id: profileId,
        name: `${user.global_name || user.username}`,
        token,
        discordUser: user,
        createdAt: new Date(),
        lastUsed: new Date(),
        isFavorite: true,
        isActive: true
      };

      setProfiles([newProfile]);
      saveProfiles([newProfile]);
      setCurrentProfile(newProfile);
      setCurrentUser(user);
      setDiscordApi(api);
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, profileId);

      toast.success(`Добро пожаловать, ${user.global_name || user.username}!`);
      await Promise.all([
        loadServers(api, user),
        loadDMChannels(api, user)
      ]);

    } catch (error) {
      console.error('Token validation error:', error);
      if (error instanceof Error) {
        setTokenError(error.message);
      } else {
        setTokenError('Недействительный токен или ошибка сети');
      }
    } finally {
      setIsValidatingToken(false);
    }
  };

  const resetAppState = () => {
    setServers([]);
    setDmChannels([]);
    setSelectedServer('');
    setSelectedChannel('');
    setCleanupProgress({
      total: 0,
      processed: 0,
      deleted: 0,
      errors: 0,
      isRunning: false,
    });
    setLogs([]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        handleProfileSwipe(e.key === 'ArrowLeft' ? 'left' : 'right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profiles, currentProfile]);

  const loadServers = async (api: DiscordApiService, user: DiscordUser) => {
    setIsLoadingServers(true);
    try {
      const guilds = await api.getUserGuilds();
      console.log('Loaded guilds:', guilds.length);

      toast.success(`Найдено ${guilds.length} серверов. ��агружаем...`);

      const initialServers: Server[] = guilds.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: api.getGuildIconUrl(guild, 64) || undefined,
        categories: [],
        uncategorizedChannels: [],
        isLoadingChannels: false,
        channelsLoaded: false,
        userPermissions: guild.permissions
      }));

      setServers(initialServers);

      if (initialServers.length > 0) {
        const firstServer = initialServers[0];
        setSelectedServer(firstServer.id);
        await loadServerChannels(api, firstServer.id, user, firstServer.userPermissions);
      }

      toast.success(`Загружено ${guilds.length} серверов!`);

    } catch (error) {
      console.error('Error loading servers:', error);
      toast.error('Ошибка загрузки серверов');
    } finally {
      setIsLoadingServers(false);
    }
  };

  const loadDMChannels = async (api: DiscordApiService, user: DiscordUser) => {
    setIsLoadingDMs(true);
    try {
      const dmChannels = await api.getUserDMChannels();

      const dmChannelInfos: DMChannelInfo[] = dmChannels
        .filter(dm => dm.last_message_id)
        .map(dm => ({
          id: dm.id,
          name: api.getDMChannelName(dm, user.id),
          avatar: api.getDMChannelAvatar(dm, user.id) || undefined,
          type: dm.type === 3 ? 'group-dm' as const : 'dm' as const,
          recipients: dm.recipients
        }));

      setDmChannels(dmChannelInfos);
      console.log(`Loaded ${dmChannelInfos.length} DM channels`);
      toast.success(`Загружено ${dmChannelInfos.length} личных чатов`);

    } catch (error) {
      console.error('Error loading DM channels:', error);
      toast.error('Ошибка загрузки личных сообщений');
    } finally {
      setIsLoadingDMs(false);
    }
  };

  const loadServerChannels = async (
    api: DiscordApiService,
    serverId: string,
    user: DiscordUser,
    userPermissions?: string
  ) => {
    console.log(`=== Starting to load channels for server ${serverId} ===`);

    setServers(prev =>
      prev.map(server =>
        server.id === serverId
          ? { ...server, isLoadingChannels: true }
          : server
      )
    );

    try {
      const channelsData = await api.getGuildChannelsWithCategories(serverId);
      const serverPermissions = userPermissions || servers.find(s => s.id === serverId)?.userPermissions;

      let memberInfo = null;
      try {
        memberInfo = await api.getGuildMember(serverId, user.id);
      } catch (error) {
        console.warn("Could not fetch member info:", error);
      }

      const mapChannelType = (type: number): Channel["type"] => {
        switch (type) {
          case 0: return "text";
          case 2: return "voice";
          case 5: return "news";
          case 10: case 11: case 12: return "thread";
          case 13: return "stage";
          case 15: return "forum";
          default: return "text";
        }
      };

      const processChannel = (ch: DiscordChannel): Channel | null => {
        const channelType = mapChannelType(ch.type);
        let permissions: ChannelPermissions = {
          canView: false,
          canReadHistory: false,
          canManageMessages: false,
          canSendMessages: false,
          canDeleteOwnMessages: false,
          hasFullAccess: false
        };

        if (serverPermissions && ch.guild_id) {
          permissions = api.calculateChannelPermissions(
            serverPermissions,
            ch,
            user.id,
            memberInfo?.roles || []
          );
        }

        if (!permissions.canView) {
          return null;
        }

        return {
          id: ch.id,
          name: ch.name || "unknown",
          type: channelType,
          messageCount: undefined,
          permissions,
          nsfw: ch.nsfw
        };
      };

      const categories: Category[] = channelsData.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        position: cat.position,
        channels: cat.channels
          .map(processChannel)
          .filter((c): c is Channel => c !== null)
      }));

      const uncategorizedChannels: Channel[] = channelsData.uncategorizedChannels
        .map(processChannel)
        .filter((c): c is Channel => c !== null);

      setServers(prev =>
        prev.map(server =>
          server.id === serverId
            ? {
              ...server,
              categories,
              uncategorizedChannels,
              isLoadingChannels: false,
              channelsLoaded: true
            }
            : server
        )
      );

      const writableChannels = [
        ...uncategorizedChannels.filter(
          ch =>
            (ch.type === "text" || ch.type === "news") &&
            ch.permissions?.canSendMessages &&
            ch.permissions?.canView &&
            ch.permissions?.canReadHistory
        ),
        ...categories.flatMap(cat =>
          cat.channels.filter(
            ch =>
              (ch.type === "text" || ch.type === "news") &&
              ch.permissions?.canSendMessages &&
              ch.permissions?.canView &&
              ch.permissions?.canReadHistory
          )
        )
      ];

      if (writableChannels.length > 0 && selectedServer === serverId) {
        setSelectedChannel(writableChannels[0].id);
      } else if (writableChannels.length === 0) {
        const serverName = servers.find(s => s.id === serverId)?.name || "Unknown";
        toast.warning(`Нет доступных для записи каналов на сервере ${serverName}`);
        if (selectedServer === serverId) {
          setSelectedChannel('');
        }
      }
    } catch (error) {
      console.error(`Error loading channels for server ${serverId}:`, error);
      toast.error(`Ошибка загрузки каналов для сервера`);

      setServers(prev =>
        prev.map(server =>
          server.id === serverId
            ? { ...server, isLoadingChannels: false, channelsLoaded: true }
            : server
        )
      );
    }
  };

  const handleServerSelect = async (serverId: string) => {
    setSelectedServer(serverId);
    setSelectedChannel('');

    const server = servers.find(s => s.id === serverId);
    if (!server || !currentUser || !discordApi) return;

    if (!server.channelsLoaded && !server.isLoadingChannels) {
      await loadServerChannels(discordApi, serverId, currentUser, server.userPermissions);
    } else if (server.channelsLoaded && !server.isLoadingChannels) {
      const writableChannels = [
        ...server.uncategorizedChannels.filter(ch =>
          (ch.type === 'text' || ch.type === 'news') &&
          ch.permissions?.canSendMessages &&
          ch.permissions?.canView &&
          ch.permissions?.canReadHistory
        ),
        ...server.categories.flatMap(cat =>
          cat.channels.filter(ch =>
            (ch.type === 'text' || ch.type === 'news') &&
            ch.permissions?.canSendMessages &&
            ch.permissions?.canView &&
            ch.permissions?.canReadHistory
          )
        )
      ];

      if (writableChannels.length > 0) {
        setSelectedChannel(writableChannels[0].id);
      }
    }
  };

  const handleDMSelect = (channelId: string) => {
    setSelectedServer('');
    setSelectedChannel(channelId);
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
  };

  const handleStartCleanup = async (config: CleanupConfig) => {
    if (!discordApi || !selectedChannel || !currentUser) return;

    const abortController = new AbortController();

    setCleanupProgress(prev => ({
      ...prev,
      isRunning: true,
      total: 0,
      processed: 0,
      deleted: 0,
      errors: 0,
      abortController
    }));
    setLogs([]);

    let logCounter = 0;
    const addLog = (type: LogEntry['type'], message: string, details?: string) => {
      const newLog: LogEntry = {
        id: `${Date.now()}-${logCounter++}`,
        timestamp: new Date(),
        type,
        message,
        details
      };
      setLogs(prev => [...prev, newLog]);
    };

    addLog('info', 'Начало процесса очистки сообщений');

    const isDM = dmChannels.some(dm => dm.id === selectedChannel);
    const channelInfo = isDM
      ? dmChannels.find(dm => dm.id === selectedChannel)
      : servers.find(s => s.id === selectedServer)?.categories.flatMap(c => c.channels).find(c => c.id === selectedChannel) ||
      servers.find(s => s.id === selectedServer)?.uncategorizedChannels.find(c => c.id === selectedChannel);

    addLog('info', `${isDM ? 'Личный чат' : 'Канал'}: ${channelInfo?.name || selectedChannel}`);
    addLog('info', 'Режим: Удаление только ваших сообщений');

    try {
      const allMessages: any[] = [];
      let lastMessageId: string | undefined;
      let batchCount = 0;
      const maxBatches = config.messageLimit.enabled ? Math.ceil(config.messageLimit.count / 100) : 50;

      addLog('info', 'Загрузка сообщений для анализа...');

      while (batchCount < maxBatches) {
        if (abortController.signal.aborted) {
          addLog('warning', 'Загрузка сообщений остановлена пользователем');
          return;
        }

        try {
          const messages = await discordApi.getChannelMessages(selectedChannel, {
            limit: 100,
            before: lastMessageId
          });

          if (messages.length === 0) break;

          const filteredMessages = messages.filter(msg => {
            if (msg.author.id !== currentUser.id) return false;

            if (config.dateRange.enabled) {
              const msgDate = new Date(msg.timestamp);
              if (config.dateRange.startDate && msgDate < new Date(config.dateRange.startDate)) return false;
              if (config.dateRange.endDate && msgDate > new Date(config.dateRange.endDate)) return false;
            }

            if (config.contentFilter.enabled) {
              if (msg.content.length < config.contentFilter.minLength ||
                msg.content.length > config.contentFilter.maxLength) return false;

              if (config.contentFilter.keywords.length > 0) {
                const hasKeyword = config.contentFilter.keywords.some(keyword =>
                  msg.content.toLowerCase().includes(keyword.toLowerCase())
                );
                if (!hasKeyword) return false;
              }

              if (config.contentFilter.containsAttachments && msg.attachments.length === 0) return false;
              if (config.contentFilter.containsEmbeds && msg.embeds.length === 0) return false;
              if (config.contentFilter.emptyMessages && msg.content.trim() !== '') return false;
            }

            return true;
          });

          allMessages.push(...filteredMessages);
          lastMessageId = messages[messages.length - 1].id;
          batchCount++;

          addLog('info', `Загружено ${allMessages.length} ваших сообщений из ${batchCount * 100} проверенных`);
          await new Promise(resolve => setTimeout(resolve, config.scanDelay || 500));

        } catch (error) {
          addLog('error', 'Ошибка при загрузке сообщений', error instanceof Error ? error.message : 'Unknown error');
          break;
        }
      }

      if (allMessages.length === 0) {
        addLog('warning', 'Не найдено ваших сообщений для удаления');
        return;
      }

      const messagesToDelete = config.messageLimit.enabled
        ? allMessages.slice(0, config.messageLimit.count)
        : allMessages;

      setCleanupProgress(prev => ({ ...prev, total: messagesToDelete.length }));
      addLog('info', `Начинаем удаление ${messagesToDelete.length} ваших сообщений`);

      let processedCount = 0;
      let deletedCount = 0;
      let errorCount = 0;

      for await (const result of discordApi.deleteMessagesWithDelay(
        selectedChannel,
        messagesToDelete.map(msg => msg.id),
        config.delay
      )) {
        if (abortController.signal.aborted) {
          addLog('warning', 'Процесс удаления остановлен пользователем');
          break;
        }

        processedCount++;

        if (result.success) {
          deletedCount++;
          console.log(`✅ Message ${result.messageId} deleted successfully`);
          if (processedCount % 5 === 0 || processedCount === messagesToDelete.length) {
            addLog('success', `Удалено сообщений: ${deletedCount}/${messagesToDelete.length}`);
          }
        } else {
          errorCount++;
          console.error(`❌ Failed to delete message ${result.messageId}:`, result.error);
          addLog('error', `Ошибка удаления сообщения`, result.error);
        }

        setCleanupProgress(prev => ({
          ...prev,
          processed: processedCount,
          deleted: deletedCount,
          errors: errorCount,
          currentAction: `Удаление сообщения ${processedCount}/${messagesToDelete.length}`
        }));
      }

      if (!abortController.signal.aborted) {
        addLog('success', `Процесс очистки завершен. Удалено: ${deletedCount}, Ошибок: ${errorCount}`);
        toast.success(`Очистка завершена! Удалено: ${deletedCount} сообщений`);
      }

    } catch (error) {
      addLog('error', 'Критическая ошибка при очистке', error instanceof Error ? error.message : 'Unknown error');
      toast.error('Критическая ошибка при очистке');
    } finally {
      setCleanupProgress(prev => ({ ...prev, isRunning: false, currentAction: undefined, abortController: undefined }));
    }
  };

  const handleStopCleanup = () => {
    setCleanupProgress(prev => {
      if (prev.abortController) {
        prev.abortController.abort();
      }
      return {
        ...prev,
        isRunning: false,
        currentAction: undefined,
        abortController: undefined
      };
    });

    setLogs(prev => [...prev, {
      id: `${Date.now()}-stop`,
      timestamp: new Date(),
      type: 'warning',
      message: 'Процесс очистки остановлен пользователем'
    }]);
    toast.warning('Очистка остановлена');
  };

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="particles" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl"
        >
          {profiles.length === 0 ? (
            <TokenSetup
              onTokenSubmit={handleTokenSubmit}
              isValidating={isValidatingToken}
              error={tokenError}
            />
          ) : (
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <UserProfileManager
                profiles={profiles}
                currentProfile={currentProfile}
                onProfileSelect={handleProfileSelect}
                onProfileAdd={handleProfileAdd}
                onProfileRemove={handleProfileRemove}
                onProfileUpdate={handleProfileUpdate}
                onProfileSwipe={handleProfileSwipe}
                isLoading={isValidatingToken}
              />
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex overflow-hidden">
      <div className="particles" />

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-shrink-0"
      >
        <ServerSidebar
          servers={servers}
          dmChannels={dmChannels}
          selectedServer={selectedServer}
          selectedChannel={selectedChannel}
          onServerSelect={handleServerSelect}
          onChannelSelect={handleChannelSelect}
          onDMSelect={handleDMSelect}
          isLoadingServers={isLoadingServers}
          isLoadingDMs={isLoadingDMs}
          currentUser={currentUser}
        />
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 overflow-hidden"
        >
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
            <div className="border-b border-slate-700/30 p-6 pb-0">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-1 mb-6 rounded-xl">
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-medium flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Настройки
                </TabsTrigger>
                <TabsTrigger
                  value="progress"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-medium flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Прогресс
                </TabsTrigger>
                <TabsTrigger
                  value="profiles"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-medium flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Профили
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="settings" className="h-full m-0">
                <div className="h-full overflow-auto p-6">
                  <CleanupSettings
                    onStartCleanup={handleStartCleanup}
                    onStopCleanup={handleStopCleanup}
                    isRunning={cleanupProgress.isRunning}
                    selectedChannel={selectedChannel}
                    currentUser={currentUser}
                  />
                </div>
              </TabsContent>

              <TabsContent value="progress" className="h-full m-0">
                <div className="h-full overflow-auto p-6">
                  <CleanupProgress
                    progress={cleanupProgress}
                    logs={logs}
                  />
                </div>
              </TabsContent>

              <TabsContent value="profiles" className="h-full m-0">
                <div className="h-full overflow-auto p-6">
                  <UserProfileManager
                    profiles={profiles}
                    currentProfile={currentProfile}
                    onProfileSelect={handleProfileSelect}
                    onProfileAdd={handleProfileAdd}
                    onProfileRemove={handleProfileRemove}
                    onProfileUpdate={handleProfileUpdate}
                    onProfileSwipe={handleProfileSwipe}
                    isLoading={isValidatingToken}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}