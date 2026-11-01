import './sources.css';
import { Category } from '../../types/enums';
import { SourceListItem } from '../../types/newsApi';
import { getElement } from '../../utils/dom';

type CategoryFilter = Category | 'all' | 'pinned';

const STORAGE_KEY = 'pinned-sources';

const isCategory = (value: string): value is Category => Object.values<string>(Category).includes(value);

class Sources {
    private sources: SourceListItem[] = [];
    private pinned: Set<string>;
    private query = '';
    private category: CategoryFilter = 'all';
    private selectedId: string | null = null;
    private isBound = false;

    constructor() {
        this.pinned = this.loadPinned();
    }

    public draw(data: SourceListItem[]): void {
        this.sources = data;
        this.drawChips();
        this.bindEvents();
        this.render();
    }

    private loadPinned(): Set<string> {
        try {
            const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

            return new Set(Array.isArray(raw) ? raw.filter((id: unknown): id is string => typeof id === 'string') : []);
        } catch {
            return new Set();
        }
    }

    private savePinned(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.pinned]));
        } catch (err) {
            console.error(err);
        }
    }

    private bindEvents(): void {
        if (this.isBound) return;
        this.isBound = true;

        const search = getElement<HTMLInputElement>('.panel__search');
        search.addEventListener('input', () => {
            this.query = search.value;
            this.render();
        });

        getElement('.panel__chips').addEventListener('click', (e) => {
            const chip = e.target instanceof Element ? e.target.closest<HTMLElement>('.chip') : null;
            const value = chip?.dataset.category;

            if (value !== undefined && (value === 'all' || value === 'pinned' || isCategory(value))) {
                this.category = value;
                this.updateChips();
                this.render();
            }
        });

        getElement('.sources').addEventListener('click', (e) => {
            const target = e.target instanceof Element ? e.target : null;
            const pin = target?.closest<HTMLElement>('.source__pin');
            const item = target?.closest<HTMLElement>('.source__item');

            if (pin?.dataset.sourceId !== undefined) {
                this.togglePin(pin.dataset.sourceId);
            } else if (item?.dataset.sourceId !== undefined) {
                this.select(item.dataset.sourceId);
            }
        });
    }

    private drawChips(): void {
        const present = new Set<Category>(this.sources.map((source) => source.category));
        const categories: CategoryFilter[] = [
            'all',
            'pinned',
            ...Object.values(Category).filter((name) => present.has(name)),
        ];
        const fragment = document.createDocumentFragment();

        categories.forEach((name) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chip';
            chip.dataset.category = name;
            fragment.append(chip);
        });

        getElement('.panel__chips').replaceChildren(fragment);
        this.updateChips();
    }

    private getChipLabel(name: string): string {
        if (name === 'pinned') return `★ Pinned · ${this.pinned.size}`;

        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    private updateChips(): void {
        document.querySelectorAll<HTMLElement>('.chip').forEach((chip) => {
            const isActive = chip.dataset.category === this.category;
            chip.textContent = this.getChipLabel(chip.dataset.category ?? '');
            chip.classList.toggle('is-active', isActive);
            chip.setAttribute('aria-pressed', String(isActive));
        });
    }

    private matchesCategory(source: SourceListItem): boolean {
        switch (this.category) {
            case 'all':
                return true;
            case 'pinned':
                return this.pinned.has(source.id);
            default:
                return source.category === this.category;
        }
    }

    private getFiltered(): SourceListItem[] {
        const query = this.query.trim().toLowerCase();

        return this.sources.filter(
            (source) => this.matchesCategory(source) && source.name.toLowerCase().includes(query)
        );
    }

    private render(): void {
        const items = this.getFiltered();
        const template = getElement<HTMLTemplateElement>('#sourceItemTemp');
        const fragment = document.createDocumentFragment();

        items.forEach((item) => {
            const clone = document.importNode(template.content, true);
            const tile = getElement<HTMLElement>('.source__item', clone);
            const pin = getElement<HTMLElement>('.source__pin', clone);
            const isPinned = this.pinned.has(item.id);

            tile.dataset.sourceId = item.id;
            tile.dataset.category = item.category;
            tile.classList.toggle('is-selected', item.id === this.selectedId);
            getElement('.source__item-name', clone).textContent = item.name;
            getElement('.source__item-meta', clone).textContent = `${item.category} · ${item.country.toUpperCase()}`;

            pin.dataset.sourceId = item.id;
            pin.classList.toggle('is-pinned', isPinned);
            pin.setAttribute('aria-pressed', String(isPinned));
            pin.setAttribute('aria-label', `${isPinned ? 'Unpin' : 'Pin'} ${item.name}`);

            fragment.append(clone);
        });

        if (items.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'sources__empty';
            empty.textContent =
                this.category === 'pinned' && this.pinned.size === 0
                    ? 'Pin sources with the star to find them here'
                    : 'No sources found';
            fragment.append(empty);
        }

        getElement('.sources').replaceChildren(fragment);
        getElement('.panel__count').textContent = `${items.length} of ${this.sources.length}`;
    }

    private togglePin(id: string): void {
        if (this.pinned.has(id)) {
            this.pinned.delete(id);
        } else {
            this.pinned.add(id);
        }

        this.savePinned();

        const list = getElement('.sources');
        const scrollTop = list.scrollTop;
        this.updateChips();
        this.render();
        list.scrollTop = scrollTop;
    }

    private select(id: string): void {
        this.selectedId = id;

        document.querySelectorAll<HTMLElement>('.source__item').forEach((tile) => {
            tile.classList.toggle('is-selected', tile.dataset.sourceId === id);
        });

        const name = this.sources.find((source) => source.id === id)?.name;
        const heading = getElement<HTMLElement>('.news__heading');
        heading.textContent = name === undefined ? '' : `News from ${name}`;
        heading.hidden = name === undefined;
    }
}

export default Sources;
