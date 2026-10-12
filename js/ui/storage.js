// Gravity Rush - Local Storage & Persistence System
export class StorageManager {
    static STORAGE_KEY = 'gravity_rush_save_data';

    static defaultData() {
        return {
            highestUnlockedLevel: 1,
            levels: {}, // { [levelNumber]: { completed: boolean, stars: number, bestTime: number, deaths: number } }
            totalDeaths: 0,
            selectedSkin: 'azure', // azure, crimson, emerald, violet, solar, silver
            settings: {
                masterVolume: 0.8,
                sfxVolume: 0.8,
                musicVolume: 0.6,
                screenShake: true,
                particles: 'high' // 'low', 'medium', 'high'
            }
        };
    }

    static load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) {
                const initial = this.defaultData();
                this.save(initial);
                return initial;
            }
            const parsed = JSON.parse(raw);
            const fallback = this.defaultData();
            return {
                ...fallback,
                ...parsed,
                settings: { ...fallback.settings, ...(parsed.settings || {}) },
                levels: parsed.levels || {}
            };
        } catch (e) {
            console.warn('Storage load failed, using defaults', e);
            return this.defaultData();
        }
    }

    static save(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Storage save failed', e);
        }
    }

    static recordLevelComplete(levelNumber, completionTime, deaths, stars) {
        const data = this.load();
        const currentRecord = data.levels[levelNumber] || {
            completed: false,
            stars: 0,
            bestTime: Infinity,
            deaths: 0
        };

        const isNewBestTime = completionTime < (currentRecord.bestTime || Infinity);
        const bestTime = isNewBestTime ? completionTime : currentRecord.bestTime;
        const highestStars = Math.max(currentRecord.stars || 0, stars);

        data.levels[levelNumber] = {
            completed: true,
            stars: highestStars,
            bestTime: bestTime,
            deaths: (currentRecord.deaths || 0) + deaths
        };

        if (levelNumber >= data.highestUnlockedLevel) {
            data.highestUnlockedLevel = levelNumber + 1;
        }

        this.save(data);

        return {
            isNewBestTime,
            bestTime,
            stars: highestStars
        };
    }

    static recordDeath() {
        const data = this.load();
        data.totalDeaths = (data.totalDeaths || 0) + 1;
        this.save(data);
    }

    static setSkin(skinId) {
        const data = this.load();
        data.selectedSkin = skinId;
        this.save(data);
    }

    static updateSettings(newSettings) {
        const data = this.load();
        data.settings = { ...data.settings, ...newSettings };
        this.save(data);
    }

    static resetProgress() {
        const fresh = this.defaultData();
        this.save(fresh);
        return fresh;
    }
}
