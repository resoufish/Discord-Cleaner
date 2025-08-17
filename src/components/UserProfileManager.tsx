import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import {
    Users,
    Plus,
    Star,
    Trash2,
    Crown,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    Settings,
    User,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import type { DiscordUser } from '../types';

export interface UserProfile {
    id: string;
    name: string;
    token: string;
    discordUser: DiscordUser;
    createdAt: Date;
    lastUsed: Date;
    isFavorite: boolean;
    isActive: boolean;
}

interface UserProfileManagerProps {
    profiles: UserProfile[];
    currentProfile: UserProfile | null;
    onProfileSelect: (profile: UserProfile) => Promise<void>;
    onProfileAdd: (name: string, token: string) => Promise<void>;
    onProfileRemove: (profileId: string) => void;
    onProfileUpdate: (profileId: string, updates: Partial<UserProfile>) => void;
    onProfileSwipe: (direction: 'left' | 'right') => void;
    isLoading: boolean;
}

export function UserProfileManager({
    profiles,
    currentProfile,
    onProfileSelect,
    onProfileAdd,
    onProfileRemove,
    onProfileUpdate,
    onProfileSwipe,
    isLoading
}: UserProfileManagerProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileToken, setNewProfileToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [addError, setAddError] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddProfile = async () => {
        if (!newProfileName.trim() || !newProfileToken.trim()) {
            setAddError('Заполните все поля');
            return;
        }

        const tokenPattern = /^(mfa\.[A-Za-z0-9_-]{20,})|([A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6,7}\.[A-Za-z0-9_-]{27,})$/;
        if (!tokenPattern.test(newProfileToken.trim())) {
            setAddError('Неверный формат токена');
            return;
        }

        setIsAdding(true);
        setAddError('');

        try {
            await onProfileAdd(newProfileName.trim(), newProfileToken.trim());
            setNewProfileName('');
            setNewProfileToken('');
            setShowAddDialog(false);
        } catch (error) {
            setAddError(error instanceof Error ? error.message : 'Ошибка добавления профиля');
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggleFavorite = (profile: UserProfile) => {
        onProfileUpdate(profile.id, { isFavorite: !profile.isFavorite });
    };

    const getTimeSince = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} дн. назад`;
        if (hours > 0) return `${hours} ч. назад`;
        if (minutes > 0) return `${minutes} мин. назад`;
        return 'Только что';
    };

    const getUserAvatarUrl = (user: DiscordUser) => {
        if (user.avatar) {
            return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=128`;
        }
        const discriminator = parseInt(user.discriminator) || 0;
        return `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`;
    };

    const sortedProfiles = [...profiles].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return b.lastUsed.getTime() - a.lastUsed.getTime();
    });

    return (
        <div className="h-full flex flex-col gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 space-y-4"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Управление профилями</h1>
                        <p className="text-slate-400 mt-1">Переключайтесь между Discord аккаунтами</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                            {profiles.length} {profiles.length === 1 ? 'профиль' : profiles.length < 5 ? 'профиля' : 'профилей'}
                        </Badge>

                        {profiles.length > 1 && (
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <span>Alt + ←/→ для переключения</span>
                            </div>
                        )}
                    </div>

                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0">
                                <Plus className="w-4 h-4 mr-2" />
                                Добавить профиль
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass">
                            <DialogHeader>
                                <DialogTitle className="text-white flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Добавить новый профиль
                                </DialogTitle>
                                <DialogDescription className="text-slate-300">
                                    Добавьте Discord аккаунт для управления несколькими профилями
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="profile-name" className="text-slate-200">Название профиля</Label>
                                    <Input
                                        id="profile-name"
                                        value={newProfileName}
                                        onChange={(e) => setNewProfileName(e.target.value)}
                                        placeholder="Введите название профиля..."
                                        className="bg-slate-800/50 border-slate-600/50 text-white"
                                        disabled={isAdding}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="profile-token" className="text-slate-200">Discord токен</Label>
                                    <div className="relative">
                                        <Input
                                            id="profile-token"
                                            type={showToken ? "text" : "password"}
                                            value={newProfileToken}
                                            onChange={(e) => setNewProfileToken(e.target.value)}
                                            placeholder="Вставьте Discord токен..."
                                            className="pr-12 bg-slate-800/50 border-slate-600/50 text-white"
                                            disabled={isAdding}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowToken(!showToken)}
                                            className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-slate-700/50"
                                            disabled={isAdding}
                                        >
                                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {addError && (
                                    <Alert className="border-red-500/30 bg-red-500/10">
                                        <AlertTriangle className="h-4 w-4 text-red-400" />
                                        <AlertDescription className="text-red-200">
                                            {addError}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleAddProfile}
                                        disabled={isAdding || !newProfileName.trim() || !newProfileToken.trim()}
                                        className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                                    >
                                        {isAdding ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Добавление...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Добавить
                                            </div>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAddDialog(false)}
                                        disabled={isAdding}
                                        className="border-slate-600/50 hover:bg-slate-700/50"
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {currentProfile && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-shrink-0"
                >
                    <Card className="glass hover-lift border-violet-500/30">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={getUserAvatarUrl(currentProfile.discordUser)}
                                        alt={currentProfile.discordUser.username}
                                        className="w-16 h-16 rounded-full ring-2 ring-violet-500/50"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                                        <Crown className="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-white">{currentProfile.name}</h3>
                                        {currentProfile.isFavorite && (
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        )}
                                        <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                                            Активный
                                        </Badge>
                                    </div>
                                    <p className="text-slate-300">
                                        {currentProfile.discordUser.global_name || currentProfile.discordUser.username}
                                        <span className="text-slate-500">#{currentProfile.discordUser.discriminator}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Последний вход: {getTimeSince(currentProfile.lastUsed)}
                                    </p>
                                </div>

                                {profiles.length > 1 && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onProfileSwipe('left')}
                                            className="border-slate-600/50 hover:bg-slate-700/50"
                                            disabled={isLoading}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onProfileSwipe('right')}
                                            className="border-slate-600/50 hover:bg-slate-700/50"
                                            disabled={isLoading}
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="flex-1 overflow-hidden">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Все профили
                </h2>

                {profiles.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-64 text-center"
                    >
                        <Users className="w-16 h-16 text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium text-slate-300 mb-2">Нет профилей</h3>
                        <p className="text-slate-500 mb-4">Добавьте первый профиль для начала работы</p>
                        <Button
                            onClick={() => setShowAddDialog(true)}
                            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Добавить профиль
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-auto max-h-96">
                        <AnimatePresence>
                            {sortedProfiles.map((profile, index) => (
                                <motion.div
                                    key={profile.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card
                                        className={`glass hover-lift cursor-pointer transition-all duration-300 ${profile.isActive
                                            ? 'border-violet-500/50 bg-violet-500/10'
                                            : 'hover:border-slate-600/50'
                                            }`}
                                        onClick={() => !profile.isActive && !isLoading && onProfileSelect(profile)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img
                                                        src={getUserAvatarUrl(profile.discordUser)}
                                                        alt={profile.discordUser.username}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                    {profile.isActive && (
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-white truncate">{profile.name}</h4>
                                                        {profile.isFavorite && (
                                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                                        )}
                                                        {profile.isActive && (
                                                            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                                                Активный
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-300 truncate">
                                                        {profile.discordUser.global_name || profile.discordUser.username}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {getTimeSince(profile.lastUsed)}
                                                    </p>
                                                </div>

                                                <div className="flex gap-1 flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleFavorite(profile);
                                                        }}
                                                        className="h-8 w-8 p-0 hover:bg-slate-700/50"
                                                    >
                                                        <Star
                                                            className={`w-4 h-4 ${profile.isFavorite
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-slate-500'
                                                                }`}
                                                        />
                                                    </Button>

                                                    {!profile.isActive && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onProfileRemove(profile.id);
                                                            }}
                                                            className="h-8 w-8 p-0 hover:bg-red-500/20 text-slate-500 hover:text-red-400"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <div className="bg-slate-800/95 p-6 rounded-xl border border-slate-700/50 flex items-center gap-4">
                            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                            <div>
                                <p className="text-white font-medium">Переключение профиля...</p>
                                <p className="text-slate-400 text-sm">Проверка токена и загрузка данных</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}