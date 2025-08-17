import { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { BrandLogo } from './ui/brand-logo';
import { motion, AnimatePresence } from 'motion/react';
import {
    Hash,
    Volume2,
    ChevronDown,
    ChevronRight,
    MessageCircle,
    Users,
    Shield,
    Loader2,
    Megaphone,
    Mic,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import type { DiscordUser } from '../types';

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
    permissions?: any;
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

interface ServerSidebarProps {
    servers: Server[];
    dmChannels: DMChannelInfo[];
    selectedServer: string;
    selectedChannel: string;
    onServerSelect: (serverId: string) => void;
    onChannelSelect: (channelId: string) => void;
    onDMSelect: (channelId: string) => void;
    isLoadingServers: boolean;
    isLoadingDMs: boolean;
    currentUser: DiscordUser | null;
}

export function ServerSidebar({
    servers,
    dmChannels,
    selectedServer,
    selectedChannel,
    onServerSelect,
    onChannelSelect,
    onDMSelect,
    isLoadingServers,
    isLoadingDMs,
    currentUser
}: ServerSidebarProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [showDMs, setShowDMs] = useState(true);

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const getChannelIcon = (channel: Channel) => {
        switch (channel.type) {
            case 'text':
                return channel.nsfw ? <Lock className="w-4 h-4 text-red-400" /> : <Hash className="w-4 h-4" />;
            case 'voice':
                return <Volume2 className="w-4 h-4" />;
            case 'news':
                return <Megaphone className="w-4 h-4" />;
            case 'stage':
                return <Mic className="w-4 h-4" />;
            case 'forum':
                return <MessageCircle className="w-4 h-4" />;
            default:
                return <Hash className="w-4 h-4" />;
        }
    };

    const getServerIcon = (server: Server) => {
        if (server.icon) {
            return (
                <img
                    src={server.icon}
                    alt={server.name}
                    className="w-8 h-8 rounded-full object-cover"
                />
            );
        }

        const initials = server.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        return (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                {initials}
            </div>
        );
    };

    const getDMAvatar = (dm: DMChannelInfo) => {
        if (dm.avatar) {
            return (
                <img
                    src={dm.avatar}
                    alt={dm.name}
                    className="w-6 h-6 rounded-full object-cover"
                />
            );
        }

        const initials = dm.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        return (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                {initials}
            </div>
        );
    };

    const canDeleteMessages = (channel: Channel) => {
        return channel.permissions?.canSendMessages &&
            channel.permissions?.canView &&
            channel.permissions?.canReadHistory;
    };

    return (
        <div className="w-80 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col h-full">
            <div className="p-4 border-b border-slate-700/30">
                <div className="flex items-center gap-3 mb-3">
                    <BrandLogo variant="icon" size="sm" animated />
                    <div>
                        <h2 className="font-semibold text-white">Discord Cleaner</h2>
                        <p className="text-xs text-slate-400">Выберите канал для очистки</p>
                    </div>
                </div>

                {currentUser && (
                    <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg">
                        <img
                            src={`https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}?size=32`}
                            alt={currentUser.username}
                            className="w-6 h-6 rounded-full"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://cdn.discordapp.com/embed/avatars/${parseInt(currentUser.discriminator) % 5}.png`;
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {currentUser.global_name || currentUser.username}
                            </p>
                            <p className="text-xs text-slate-400">
                                #{currentUser.discriminator}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDMs(!showDMs)}
                                className="text-slate-300 hover:text-white p-1 h-auto"
                            >
                                <div className="flex items-center gap-2">
                                    {showDMs ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    <span className="font-medium">Личные сообщения</span>
                                    <Badge variant="secondary" className="bg-slate-600/50 text-slate-300 text-xs">
                                        {dmChannels.length}
                                    </Badge>
                                </div>
                            </Button>
                        </div>

                        <AnimatePresence>
                            {showDMs && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1"
                                >
                                    {isLoadingDMs ? (
                                        <div className="space-y-2">
                                            {[...Array(3)].map((_, i) => (
                                                <Skeleton key={i} className="h-8 rounded-lg bg-slate-700/50" />
                                            ))}
                                        </div>
                                    ) : dmChannels.length > 0 ? (
                                        dmChannels.map((dm) => (
                                            <Button
                                                key={dm.id}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDMSelect(dm.id)}
                                                className={`w-full justify-start text-left h-auto p-2 hover:bg-slate-700/50 transition-colors ${selectedChannel === dm.id
                                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                                    : 'text-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 w-full">
                                                    {getDMAvatar(dm)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate font-medium">{dm.name}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {dm.type === 'group-dm' ? `Группа • ${dm.recipients.length} участников` : 'Личный чат'}
                                                        </p>
                                                    </div>
                                                    {dm.type === 'group-dm' && (
                                                        <Users className="w-4 h-4 text-slate-500" />
                                                    )}
                                                </div>
                                            </Button>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm text-center py-2">
                                            Нет доступных чатов
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-slate-300 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Серверы
                                <Badge variant="secondary" className="bg-slate-600/50 text-slate-300 text-xs">
                                    {servers.length}
                                </Badge>
                            </h3>
                        </div>

                        {isLoadingServers ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 rounded-lg bg-slate-700/50" />
                                ))}
                            </div>
                        ) : servers.length > 0 ? (
                            <div className="space-y-2">
                                {servers.map((server) => (
                                    <div key={server.id}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onServerSelect(server.id)}
                                            className={`w-full justify-start h-auto p-3 hover:bg-slate-700/50 transition-colors ${selectedServer === server.id
                                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                                : 'text-slate-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                {getServerIcon(server)}
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium truncate">{server.name}</p>
                                                    {server.isLoadingChannels && (
                                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            Загрузка каналов...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Button>

                                        {selectedServer === server.id && server.channelsLoaded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="ml-4 mt-2 space-y-1"
                                            >
                                                {server.uncategorizedChannels.length > 0 && (
                                                    <div className="space-y-1">
                                                        {server.uncategorizedChannels
                                                            .filter(ch => ch.type === 'text' || ch.type === 'news')
                                                            .map((channel) => (
                                                                <Button
                                                                    key={channel.id}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => onChannelSelect(channel.id)}
                                                                    className={`w-full justify-start h-auto p-2 text-left hover:bg-slate-700/30 transition-colors ${selectedChannel === channel.id
                                                                        ? 'bg-violet-500/15 text-violet-300'
                                                                        : 'text-slate-400'
                                                                        }`}
                                                                    disabled={!canDeleteMessages(channel)}
                                                                >
                                                                    <div className="flex items-center gap-2 w-full">
                                                                        {getChannelIcon(channel)}
                                                                        <span className="truncate">{channel.name}</span>
                                                                        {!canDeleteMessages(channel) && (
                                                                            <EyeOff className="w-3 h-3 text-red-400 ml-auto" />
                                                                        )}
                                                                    </div>
                                                                </Button>
                                                            ))}
                                                    </div>
                                                )}

                                                {server.categories.map((category) => {
                                                    const textChannels = category.channels.filter(ch =>
                                                        ch.type === 'text' || ch.type === 'news'
                                                    );

                                                    if (textChannels.length === 0) return null;

                                                    return (
                                                        <div key={category.id} className="space-y-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleCategory(category.id)}
                                                                className="w-full justify-start h-auto p-1 text-slate-500 hover:text-slate-300 uppercase text-xs font-medium"
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    {expandedCategories.has(category.id) ?
                                                                        <ChevronDown className="w-3 h-3" /> :
                                                                        <ChevronRight className="w-3 h-3" />
                                                                    }
                                                                    {category.name}
                                                                </div>
                                                            </Button>

                                                            <AnimatePresence>
                                                                {expandedCategories.has(category.id) && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        className="space-y-1 ml-2"
                                                                    >
                                                                        {textChannels.map((channel) => (
                                                                            <Button
                                                                                key={channel.id}
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => onChannelSelect(channel.id)}
                                                                                className={`w-full justify-start h-auto p-2 text-left hover:bg-slate-700/30 transition-colors ${selectedChannel === channel.id
                                                                                    ? 'bg-violet-500/15 text-violet-300'
                                                                                    : 'text-slate-400'
                                                                                    }`}
                                                                                disabled={!canDeleteMessages(channel)}
                                                                            >
                                                                                <div className="flex items-center gap-2 w-full">
                                                                                    {getChannelIcon(channel)}
                                                                                    <span className="truncate">{channel.name}</span>
                                                                                    {!canDeleteMessages(channel) && (
                                                                                        <EyeOff className="w-3 h-3 text-red-400 ml-auto" />
                                                                                    )}
                                                                                </div>
                                                                            </Button>
                                                                        ))}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm text-center py-4">
                                Нет доступных серверов
                            </p>
                        )}
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-700/30">
                <div className="text-xs text-slate-500 text-center">
                    {selectedChannel ? (
                        <div className="flex items-center gap-1 justify-center">
                            <Eye className="w-3 h-3 text-green-400" />
                            Канал выбран для очистки
                        </div>
                    ) : (
                        'Выберите канал для начала'
                    )}
                </div>
            </div>
        </div>
    );
}