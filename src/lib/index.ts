import type { ChannelPermissions, DiscordChannel, DiscordChannelsWithCategories, DiscordDMChannel, DiscordGuild, DiscordGuildMember, DiscordMessage, DiscordUser, GetMessagesOptions, MessageDeleteResult } from "../types";

export class DiscordApiService {
    private token: string;
    private baseUrl = 'https://discord.com/api/v10';
    private rateLimitDelay = 1000;

    constructor(token: string) {
        this.token = token;
    }

    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders = {
            'Authorization': this.token,
            'Content-Type': 'application/json',
            'User-Agent': 'DiscordCleaner/1.0',
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.rateLimitDelay;
            console.warn(`Rate limited. Retrying after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.makeRequest<T>(endpoint, options);
        }

        if (!response.ok) {
            let errorText: string;
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorText = errorData.message || JSON.stringify(errorData);
                } else {
                    errorText = await response.text();
                }
            } catch {
                errorText = `HTTP ${response.status} ${response.statusText}`;
            }
            throw new Error(`Discord API Error (${response.status}): ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON response but got content-type: ${contentType || 'unknown'}`);
        }

        try {
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
        }
    }

    async getCurrentUser(): Promise<DiscordUser> {
        return this.makeRequest<DiscordUser>('/users/@me');
    }

    async getUserGuilds(): Promise<DiscordGuild[]> {
        return this.makeRequest<DiscordGuild[]>('/users/@me/guilds');
    }

    async getUserDMChannels(): Promise<DiscordDMChannel[]> {
        return this.makeRequest<DiscordDMChannel[]>('/users/@me/channels');
    }

    async getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
        return this.makeRequest<DiscordChannel[]>(`/guilds/${guildId}/channels`);
    }

    async getGuildChannelsWithCategories(guildId: string): Promise<DiscordChannelsWithCategories> {
        const channels = await this.getGuildChannels(guildId);

        const categories: { [key: string]: { id: string; name: string; position: number; channels: DiscordChannel[] } } = {};
        const uncategorizedChannels: DiscordChannel[] = [];

        channels.forEach(channel => {
            if (channel.type === 4) {
                categories[channel.id] = {
                    id: channel.id,
                    name: channel.name || 'Unknown Category',
                    position: channel.position || 0,
                    channels: []
                };
            }
        });

        channels.forEach(channel => {
            if (channel.type !== 4) { // Not a category
                if (channel.parent_id && categories[channel.parent_id]) {
                    categories[channel.parent_id].channels.push(channel);
                } else {
                    uncategorizedChannels.push(channel);
                }
            }
        });

        const sortedCategories = Object.values(categories)
            .sort((a, b) => a.position - b.position)
            .map(category => ({
                ...category,
                channels: category.channels.sort((a, b) => (a.position || 0) - (b.position || 0))
            }));

        return {
            categories: sortedCategories,
            uncategorizedChannels: uncategorizedChannels.sort((a, b) => (a.position || 0) - (b.position || 0))
        };
    }

    async getGuildMember(guildId: string, userId: string): Promise<DiscordGuildMember> {
        return this.makeRequest<DiscordGuildMember>(`/guilds/${guildId}/members/${userId}`);
    }

    async getChannelMessages(channelId: string, options: GetMessagesOptions = {}): Promise<DiscordMessage[]> {
        const params = new URLSearchParams();

        if (options.around) params.append('around', options.around);
        if (options.before) params.append('before', options.before);
        if (options.after) params.append('after', options.after);
        if (options.limit) params.append('limit', options.limit.toString());

        const query = params.toString();
        const endpoint = `/channels/${channelId}/messages${query ? `?${query}` : ''}`;

        return this.makeRequest<DiscordMessage[]>(endpoint);
    }

    async deleteMessage(channelId: string, messageId: string): Promise<void> {
        const url = `${this.baseUrl}/channels/${channelId}/messages/${messageId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': this.token,
                'User-Agent': 'DiscordCleaner/1.0',
            },
        });

        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.rateLimitDelay;
            console.warn(`Rate limited. Retrying after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.deleteMessage(channelId, messageId);
        }

        if (response.status === 204) {
            return;
        }

        if (response.ok) {
            return;
        }

        let errorText: string;
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                errorText = errorData.message || JSON.stringify(errorData);
            } else {
                errorText = await response.text();
            }
        } catch {
            errorText = `HTTP ${response.status} ${response.statusText}`;
        }

        throw new Error(`Discord API Error (${response.status}): ${errorText}`);
    }

    async *deleteMessagesWithDelay(
        channelId: string,
        messageIds: string[],
        delay: number = 1000
    ): AsyncGenerator<MessageDeleteResult> {
        for (const messageId of messageIds) {
            try {
                await this.deleteMessage(channelId, messageId);
                yield { success: true, messageId };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                yield { success: false, messageId, error: errorMessage };
            }

            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    getGuildIconUrl(guild: DiscordGuild, size: number = 128): string | null {
        if (!guild.icon) return null;
        return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}?size=${size}`;
    }

    getUserAvatarUrl(user: DiscordUser, size: number = 128): string {
        if (user.avatar) {
            return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=${size}`;
        }

        const discriminator = parseInt(user.discriminator) || 0;
        const defaultAvatarIndex = discriminator % 5;
        return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
    }

    getDMChannelName(channel: DiscordDMChannel, currentUserId: string): string {
        if (channel.type === 1) {
            const otherUser = channel.recipients.find(user => user.id !== currentUserId);
            return otherUser ? (otherUser.global_name || otherUser.username) : 'Unknown User';
        } else if (channel.type === 3) {
            const otherUsers = channel.recipients.filter(user => user.id !== currentUserId);
            if (otherUsers.length === 0) return 'Empty Group';
            if (otherUsers.length === 1) return otherUsers[0].global_name || otherUsers[0].username;
            return `Group with ${otherUsers.slice(0, 2).map(u => u.global_name || u.username).join(', ')}${otherUsers.length > 2 ? ` and ${otherUsers.length - 2} others` : ''}`;
        }
        return 'Unknown Channel';
    }

    getDMChannelAvatar(channel: DiscordDMChannel, currentUserId: string): string | null {
        if (channel.type === 1) {
            const otherUser = channel.recipients.find(user => user.id !== currentUserId);
            return otherUser ? this.getUserAvatarUrl(otherUser, 64) : null;
        }
        return null;
    }

    calculateChannelPermissions(
        userPermissions: string,
        channel: DiscordChannel,
        userId: string,
        userRoles: string[] = []
    ): ChannelPermissions {
        const permissions = BigInt(userPermissions);
        const ADMINISTRATOR = BigInt('0x8');
        const VIEW_CHANNEL = BigInt('0x400');
        const READ_MESSAGE_HISTORY = BigInt('0x10000');
        const SEND_MESSAGES = BigInt('0x800');
        const MANAGE_MESSAGES = BigInt('0x2000');

        if (permissions & ADMINISTRATOR) {
            return {
                canView: true,
                canReadHistory: true,
                canManageMessages: true,
                canSendMessages: true,
                canDeleteOwnMessages: true,
                hasFullAccess: true
            };
        }

        let finalPermissions = permissions;

        if (channel.permission_overwrites) {
            const everyoneOverwrite = channel.permission_overwrites.find(ow =>
                ow.id === channel.guild_id && ow.type === 0
            );
            if (everyoneOverwrite) {
                finalPermissions &= ~BigInt(everyoneOverwrite.deny);
                finalPermissions |= BigInt(everyoneOverwrite.allow);
            }

            for (const roleId of userRoles) {
                const roleOverwrite = channel.permission_overwrites.find(ow =>
                    ow.id === roleId && ow.type === 0
                );
                if (roleOverwrite) {
                    finalPermissions &= ~BigInt(roleOverwrite.deny);
                    finalPermissions |= BigInt(roleOverwrite.allow);
                }
            }

            const userOverwrite = channel.permission_overwrites.find(ow =>
                ow.id === userId && ow.type === 1
            );
            if (userOverwrite) {
                finalPermissions &= ~BigInt(userOverwrite.deny);
                finalPermissions |= BigInt(userOverwrite.allow);
            }
        }

        return {
            canView: Boolean(finalPermissions & VIEW_CHANNEL),
            canReadHistory: Boolean(finalPermissions & READ_MESSAGE_HISTORY),
            canManageMessages: Boolean(finalPermissions & MANAGE_MESSAGES),
            canSendMessages: Boolean(finalPermissions & SEND_MESSAGES),
            canDeleteOwnMessages: true,
            hasFullAccess: Boolean(finalPermissions & ADMINISTRATOR)
        };
    }
    setRateLimitDelay(delay: number): void {
        this.rateLimitDelay = Math.max(100, delay);
    }

    getRateLimitDelay(): number {
        return this.rateLimitDelay;
    }
}