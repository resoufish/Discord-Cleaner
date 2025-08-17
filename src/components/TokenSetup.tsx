import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { BrandLogo } from './ui/brand-logo';
import { motion } from 'motion/react';
import { Eye, EyeOff, Shield, Key, AlertTriangle, Info, ExternalLink } from 'lucide-react';

interface TokenSetupProps {
    onTokenSubmit: (token: string) => Promise<void>;
    isValidating: boolean;
    error: string;
}

export function TokenSetup({ onTokenSubmit, isValidating, error }: TokenSetupProps) {
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) return;

        try {
            await onTokenSubmit(token.trim());
        } catch (err) {
        }
    };

    const validateTokenFormat = (value: string) => {
        const discordTokenPattern = /^(mfa\.[A-Za-z0-9_-]{20,})|([A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6,7}\.[A-Za-z0-9_-]{27,})$/;
        return discordTokenPattern.test(value);
    };

    const isTokenValid = validateTokenFormat(token);

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="glass hover-lift">
                    <CardHeader className="text-center space-y-4">
                        <BrandLogo variant="icon" size="lg" animated className="mx-auto" />
                        <div>
                            <CardTitle className="text-2xl font-bold text-white">
                                Discord Cleaner
                            </CardTitle>
                            <CardDescription className="text-slate-300 mt-2">
                                Безопасная очистка ваших сообщений Discord
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <Alert className="border-blue-500/30 bg-blue-500/10">
                            <Info className="h-4 w-4 text-blue-400" />
                            <AlertDescription className="text-blue-200">
                                Ваш токен остается на этом устройстве и не передается на внешние серверы.
                            </AlertDescription>
                        </Alert>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="token" className="text-slate-200 font-medium flex items-center gap-2">
                                    <Key className="w-4 h-4" />
                                    Discord токен
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="token"
                                        type={showToken ? "text" : "password"}
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="Вставьте ваш Discord токен..."
                                        className={`pr-12 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-violet-500/50 ${token && !isTokenValid ? 'border-red-500/50' : ''
                                            }`}
                                        disabled={isValidating}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowToken(!showToken)}
                                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-slate-700/50"
                                    >
                                        {showToken ? (
                                            <EyeOff className="w-4 h-4 text-slate-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-slate-400" />
                                        )}
                                    </Button>
                                </div>
                                {token && !isTokenValid && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Неверный формат токена
                                    </p>
                                )}
                            </div>

                            {error && (
                                <Alert className="border-red-500/30 bg-red-500/10">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <AlertDescription className="text-red-200">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={!token.trim() || !isTokenValid || isValidating}
                            >
                                {isValidating ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Проверка токена...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Войти
                                    </div>
                                )}
                            </Button>
                        </form>

                        <div className="text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowInstructions(!showInstructions)}
                                className="text-slate-400 hover:text-violet-400 transition-colors"
                            >
                                {showInstructions ? 'Скрыть инструкции' : 'Как получить токен?'}
                            </Button>
                        </div>

                        {showInstructions && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                <Alert className="border-amber-500/30 bg-amber-500/10">
                                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                                    <AlertDescription className="text-amber-200">
                                        <strong>Внимание!</strong> Никогда не делитесь своим токеном с другими!
                                    </AlertDescription>
                                </Alert>

                                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 space-y-3">
                                    <h4 className="font-medium text-white flex items-center gap-2">
                                        <Info className="w-4 h-4 text-blue-400" />
                                        Инструкция по получению токена:
                                    </h4>
                                    <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                                        <li>Откройте Discord в браузере</li>
                                        <li>Нажмите F12 (Инструменты разработчика)</li>
                                        <li>Перейдите во вкладку "Network" / "Сеть"</li>
                                        <li>Обновите страницу (F5)</li>
                                        <li>В фильтре поиска введите "api"</li>
                                        <li>Нажмите на любой запрос к discord.com</li>
                                        <li>В Headers найдите "authorization"</li>
                                        <li>Скопируйте значение токена</li>
                                    </ol>

                                    <div className="flex items-center gap-2 pt-2">
                                        <ExternalLink className="w-4 h-4 text-violet-400" />
                                        <a
                                            href="https://www.youtube.com/results?search_query=how+to+get+discord+token"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-violet-400 hover:text-violet-300 text-sm underline transition-colors"
                                        >
                                            Видео-инструкция на YouTube
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-400" />
                                Функции безопасности:
                            </h4>
                            <ul className="text-sm text-slate-300 space-y-1">
                                <li>• Удаление только ваших сообщений</li>
                                <li>• Локальное хранение данных</li>
                                <li>• Соблюдение лимитов Discord API</li>
                                <li>• Возможность отмены операций</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}