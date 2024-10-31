import { makeAutoObservable } from "mobx";

interface Repository {
    id: number;
    name: string;
    description: string;
    html_url: string;
    owner: {
        avatar_url: string;
    }
}

class RepositoryStore {
    repositories: Repository[] = [];
    page = 1;
    loading = false;
    sortBy = "";
    favorites: Set<number> = new Set();

    constructor() {
        makeAutoObservable(this);
    }

    // получение репозиториев с API гитхаба
    async fetchRepositories() {
        if (this.loading) return;
        this.loading = true;
        try {
            const response = await fetch(`https://api.github.com/repositories?since=${this.page}`);
            const data = await response.json();
            this.repositories.push(...data); // Добавляем новые данные в конец списка
            this.page += 1;
        } catch (error) {
            console.error("Ошибка при обращении к апи:", error);
        } finally {
            this.loading = false;
            console.log("Список репозиториев вывелся");
        }
    }

    // удаление репы
    removeRepository(id: number) {
        this.repositories = this.repositories.filter((item) => item.id !== id);
        this.favorites.delete(id); // Удаляем из избранного, если репа была там
    }

    // изменения названия репы
    editRepository(id: number, newName: string) {
        const repo = this.repositories.find((repo) => repo.id === id);
        if (repo) repo.name = newName;
    }

    // сортировка репозиториев
    setSortBy(field: keyof Repository) {
        this.sortBy = field;
        this.repositories.sort((a, b) => (a[field] > b[field] ? 1 : -1));
    }


    // добавление репозитория в избранное
    addFavorite(id: number) {
        this.favorites.add(id);
    }

    // удаление репозитория из избранного
    removeFavorite(id: number) {
        this.favorites.delete(id);
    }

    // является ли репа избранной
    isFavorite(id: number): boolean {
        return this.favorites.has(id);
    }

    // получение списка избранных
    get favoriteRepositories(): Repository[] {
        return this.repositories.filter(repo => this.favorites.has(repo.id));
    }
}

export const repositoryStore = new RepositoryStore();