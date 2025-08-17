import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { motion } from 'motion/react';
import {
    Settings2,
    Calendar,
    Filter,
    Clock,
    Play,
    Square,
    AlertTriangle,
    Zap,
    MessageCircle,
    Target,
    Shield
} from 'lucide-react';
import type { DiscordUser } from '../types';

export interface CleanupConfig {
    dateRange: {
        enabled: boolean;
        startDate: string;
        endDate: string;
    };
    contentFilter: {
        enabled: boolean;
        keywords: string[];
        minLength: number;
        maxLength: number;
        containsAttachments: boolean;
        containsEmbeds: boolean;
        emptyMessages: boolean;
    };
    messageLimit: {
        enabled: boolean;
        count: number;
    };
    delay: number;
    scanDelay: number;
}

interface CleanupSettingsProps {
    onStartCleanup: (config: CleanupConfig) => void;
    onStopCleanup: () => void;
    isRunning: boolean;
    selectedChannel: string;
    currentUser: DiscordUser | null;
}

export function CleanupSettings({
    onStartCleanup,
    onStopCleanup,
    isRunning,
    selectedChannel,
    currentUser
}: CleanupSettingsProps) {
    const [config, setConfig] = useState<CleanupConfig>({
        dateRange: {
            enabled: false,
            startDate: '',
            endDate: new Date().toISOString().split('T')[0]
        },
        contentFilter: {
            enabled: false,
            keywords: [],
            minLength: 0,
            maxLength: 4000,
            containsAttachments: false,
            containsEmbeds: false,
            emptyMessages: false
        },
        messageLimit: {
            enabled: true,
            count: 100
        },
        delay: 1000,
        scanDelay: 500
    });

    const [keywordInput, setKeywordInput] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('discord-cleaner-last-settings');
        if (saved) {
            try {
                setConfig(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to load saved settings:', error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('discord-cleaner-last-settings', JSON.stringify(config));
    }, [config]);

    const handleStartCleanup = () => {
        if (!selectedChannel) return;
        onStartCleanup(config);
    };

    const addKeyword = () => {
        const keyword = keywordInput.trim();
        if (keyword && !config.contentFilter.keywords.includes(keyword)) {
            setConfig(prev => ({
                ...prev,
                contentFilter: {
                    ...prev.contentFilter,
                    keywords: [...prev.contentFilter.keywords, keyword]
                }
            }));
            setKeywordInput('');
        }
    };

    const removeKeyword = (keyword: string) => {
        setConfig(prev => ({
            ...prev,
            contentFilter: {
                ...prev.contentFilter,
                keywords: prev.contentFilter.keywords.filter(k => k !== keyword)
            }
        }));
    };

    const updateConfig = (path: string, value: any) => {
        setConfig(prev => {
            const newConfig = { ...prev };
            const keys = path.split('.');
            let current: any = newConfig;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newConfig;
        });
    };

    const canStart = selectedChannel && currentUser && !isRunning;

    return (
        <div className="h-full flex flex-col gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 space-y-4"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                        <Settings2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Настройки очистки</h1>
                        <p className="text-slate-400 mt-1">Настройте параметры удаления ваших сообщений</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium text-sm">Безопасность</span>
                        </div>
                        <p className="text-slate-300 text-sm">Удаляются только ваши сообщения</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-medium text-sm">Задержка</span>
                        </div>
                        <p className="text-slate-300 text-sm">{config.delay}мс между запросами</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-violet-400" />
                            <span className="text-violet-400 font-medium text-sm">Лимит</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                            {config.messageLimit.enabled ? `${config.messageLimit.count} сообщений` : 'Без лимита'}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="glass hover-lift h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <Calendar className="w-5 h-5" />
                                Фильтр по дате
                            </CardTitle>
                            <CardDescription>
                                Ограничить очистку определенным периодом времени
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="date-filter" className="text-slate-300">Включить фильтр по дате</Label>
                                <Switch
                                    id="date-filter"
                                    checked={config.dateRange.enabled}
                                    onCheckedChange={(checked) => updateConfig('dateRange.enabled', checked)}
                                />
                            </div>

                            {config.dateRange.enabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-3"
                                >
                                    <div>
                                        <Label htmlFor="start-date" className="text-slate-300">Дата начала</Label>
                                        <Input
                                            id="start-date"
                                            type="date"
                                            value={config.dateRange.startDate}
                                            onChange={(e) => updateConfig('dateRange.startDate', e.target.value)}
                                            className="bg-slate-800/50 border-slate-600/50 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="end-date" className="text-slate-300">Дата окончания</Label>
                                        <Input
                                            id="end-date"
                                            type="date"
                                            value={config.dateRange.endDate}
                                            onChange={(e) => updateConfig('dateRange.endDate', e.target.value)}
                                            className="bg-slate-800/50 border-slate-600/50 text-white"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="glass hover-lift h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <Filter className="w-5 h-5" />
                                Фильтр контента
                            </CardTitle>
                            <CardDescription>
                                Настройте фильтрацию сообщений по содержимому
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="content-filter" className="text-slate-300">Включить фильтр контента</Label>
                                <Switch
                                    id="content-filter"
                                    checked={config.contentFilter.enabled}
                                    onCheckedChange={(checked) => updateConfig('contentFilter.enabled', checked)}
                                />
                            </div>

                            {config.contentFilter.enabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label className="text-slate-300">Ключевые слова</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                value={keywordInput}
                                                onChange={(e) => setKeywordInput(e.target.value)}
                                                placeholder="Введите ключевое слово..."
                                                className="bg-slate-800/50 border-slate-600/50 text-white"
                                                onKeyUp={(e) => e.key === 'Enter' && addKeyword()}
                                            />
                                            <Button
                                                onClick={addKeyword}
                                                variant="outline"
                                                size="sm"
                                                className="border-slate-600/50 hover:bg-slate-700/50"
                                            >
                                                Добавить
                                            </Button>
                                        </div>
                                        {config.contentFilter.keywords.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {config.contentFilter.keywords.map((keyword, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="bg-violet-500/20 text-violet-300 border-violet-500/30 cursor-pointer hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-colors"
                                                        onClick={() => removeKeyword(keyword)}
                                                    >
                                                        {keyword} ×
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="min-length" className="text-slate-300">Мин. длина</Label>
                                            <Input
                                                id="min-length"
                                                type="number"
                                                min="0"
                                                max="4000"
                                                value={config.contentFilter.minLength}
                                                onChange={(e) => updateConfig('contentFilter.minLength', parseInt(e.target.value) || 0)}
                                                className="bg-slate-800/50 border-slate-600/50 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="max-length" className="text-slate-300">Макс. длина</Label>
                                            <Input
                                                id="max-length"
                                                type="number"
                                                min="0"
                                                max="4000"
                                                value={config.contentFilter.maxLength}
                                                onChange={(e) => updateConfig('contentFilter.maxLength', parseInt(e.target.value) || 4000)}
                                                className="bg-slate-800/50 border-slate-600/50 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="attachments" className="text-slate-300">Только с вложениями</Label>
                                            <Switch
                                                id="attachments"
                                                checked={config.contentFilter.containsAttachments}
                                                onCheckedChange={(checked) => updateConfig('contentFilter.containsAttachments', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="embeds" className="text-slate-300">Только с эмбедами</Label>
                                            <Switch
                                                id="embeds"
                                                checked={config.contentFilter.containsEmbeds}
                                                onCheckedChange={(checked) => updateConfig('contentFilter.containsEmbeds', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="empty" className="text-slate-300">Только пустые сообщения</Label>
                                            <Switch
                                                id="empty"
                                                checked={config.contentFilter.emptyMessages}
                                                onCheckedChange={(checked) => updateConfig('contentFilter.emptyMessages', checked)}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="glass hover-lift h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <MessageCircle className="w-5 h-5" />
                                Лимит сообщений
                            </CardTitle>
                            <CardDescription>
                                Ограничить количество удаляемых сообщений
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="message-limit" className="text-slate-300">Ограничить количество</Label>
                                <Switch
                                    id="message-limit"
                                    checked={config.messageLimit.enabled}
                                    onCheckedChange={(checked) => updateConfig('messageLimit.enabled', checked)}
                                />
                            </div>

                            {config.messageLimit.enabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <Label htmlFor="message-count" className="text-slate-300">Количество сообщений</Label>
                                    <Input
                                        id="message-count"
                                        type="number"
                                        min="1"
                                        max="10000"
                                        value={config.messageLimit.count}
                                        onChange={(e) => updateConfig('messageLimit.count', parseInt(e.target.value) || 100)}
                                        className="bg-slate-800/50 border-slate-600/50 text-white"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        Рекомендуется начать с небольшого количества для тестирования
                                    </p>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="glass hover-lift h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <Zap className="w-5 h-5" />
                                Производительность
                            </CardTitle>
                            <CardDescription>
                                Настройки скорости и безопасности операций
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="delete-delay" className="text-slate-300">
                                    Задержка между удалениями (мс)
                                </Label>
                                <Input
                                    id="delete-delay"
                                    type="number"
                                    min="100"
                                    max="10000"
                                    value={config.delay}
                                    onChange={(e) => updateConfig('delay', parseInt(e.target.value) || 1000)}
                                    className="bg-slate-800/50 border-slate-600/50 text-white"
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    Минимум 100мс для соблюдения лимитов Discord API
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="scan-delay" className="text-slate-300">
                                    Задержка сканирования (мс)
                                </Label>
                                <Input
                                    id="scan-delay"
                                    type="number"
                                    min="100"
                                    max="5000"
                                    value={config.scanDelay}
                                    onChange={(e) => updateConfig('scanDelay', parseInt(e.target.value) || 500)}
                                    className="bg-slate-800/50 border-slate-600/50 text-white"
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    Задержка при загрузке сообщений для анализа
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-shrink-0"
            >
                <Card className="glass">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-white">Готовы к запуску?</h3>
                                <p className="text-slate-400 text-sm">
                                    {!selectedChannel ? 'Выберите канал для начала очистки' :
                                        !currentUser ? 'Необходима авторизация' :
                                            'Все настройки готовы к запуску'}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {isRunning ? (
                                    <Button
                                        onClick={onStopCleanup}
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        <Square className="w-4 h-4 mr-2" />
                                        Остановить
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleStartCleanup}
                                        disabled={!canStart}
                                        className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Начать очистку
                                    </Button>
                                )}
                            </div>
                        </div>

                        {!selectedChannel && (
                            <Alert className="mt-4 border-amber-500/30 bg-amber-500/10">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                <AlertDescription className="text-amber-200">
                                    Выберите канал или личный чат в боковой панели для начала очистки.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}