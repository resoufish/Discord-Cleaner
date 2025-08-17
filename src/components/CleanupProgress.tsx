import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import {
    Activity,
    CheckCircle,
    XCircle,
    Clock,
    Trash2,
    BarChart3,
    Download,
    RefreshCw
} from 'lucide-react';

export interface CleanupProgress {
    total: number;
    processed: number;
    deleted: number;
    errors: number;
    isRunning: boolean;
    currentAction?: string;
    abortController?: AbortController;
}

export interface LogEntry {
    id: string;
    timestamp: Date;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    details?: string;
}

interface CleanupProgressProps {
    progress: CleanupProgress;
    logs: LogEntry[];
}

export function CleanupProgress({ progress, logs }: CleanupProgressProps) {
    const getProgress = () => {
        if (progress.total === 0) return 0;
        return Math.round((progress.processed / progress.total) * 100);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const exportLogs = () => {
        const logText = logs.map(log =>
            `[${formatTime(log.timestamp)}] ${log.type.toUpperCase()}: ${log.message}${log.details ? ` - ${log.details}` : ''}`
        ).join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `discord-cleaner-logs-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getStatusColor = () => {
        if (progress.isRunning) return 'text-blue-400';
        if (progress.errors > 0) return 'text-amber-400';
        if (progress.processed > 0) return 'text-green-400';
        return 'text-slate-400';
    };

    const getStatusText = () => {
        if (progress.isRunning) return 'Выполняется...';
        if (progress.processed === 0) return 'Ожидание';
        if (progress.errors > 0) return 'Завершено с ошибками';
        return 'Завершено успешно';
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 space-y-4"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Прогресс очистки</h1>
                        <p className="text-slate-400 mt-1">Отслеживайте процесс удаления сообщений в реальном времени</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${progress.isRunning ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`} />
                        <span className={`text-sm font-medium ${getStatusColor()}`}>
                            {getStatusText()}
                        </span>
                    </div>

                    {progress.currentAction && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse px-3 py-1">
                            <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                            {progress.currentAction}
                        </Badge>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1"
            >
                <Card className="glass hover-lift h-full">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-white text-xl">
                                <BarChart3 className="w-6 h-6" />
                                Статистика
                            </CardTitle>

                            {logs.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportLogs}
                                    className="border-slate-600/50 hover:bg-slate-700/50"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Экспорт логов
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300 font-medium">Общий прогресс</span>
                                <span className="text-white font-bold text-lg">{getProgress()}%</span>
                            </div>
                            <Progress
                                value={getProgress()}
                                className="h-3 bg-slate-700/50"
                            />
                            {progress.total > 0 && (
                                <div className="text-sm text-slate-400 text-center">
                                    {progress.processed} из {progress.total} сообщений обработано
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-4 rounded-xl border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-400 font-medium text-sm">Обработано</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{progress.processed}</div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 p-4 rounded-xl border border-green-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 font-medium text-sm">Удалено</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{progress.deleted}</div>
                            </div>

                            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 p-4 rounded-xl border border-red-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <XCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-red-400 font-medium text-sm">Ошибки</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{progress.errors}</div>
                            </div>

                            <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 p-4 rounded-xl border border-violet-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trash2 className="w-4 h-4 text-violet-400" />
                                    <span className="text-violet-400 font-medium text-sm">Всего</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{progress.total}</div>
                            </div>
                        </div>

                        {progress.processed > 0 && (
                            <div className="bg-slate-700/30 p-4 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300 font-medium">Процент успешных удалений</span>
                                    <span className="text-green-400 font-bold text-lg">
                                        {progress.processed > 0 ? Math.round((progress.deleted / progress.processed) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {logs.length > 0 && (
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-300 font-medium">Записей в логе</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold">{logs.length}</span>
                                        <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                                            Доступен экспорт
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}