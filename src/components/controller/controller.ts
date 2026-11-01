import AppLoader from './appLoader';
import { Callback } from './loader';
import { Endpoint } from '../types/enums';
import { ArticlesResponse, SourcesResponse } from '../types/newsApi';

class AppController extends AppLoader {
    public getSources(callback: Callback<SourcesResponse>): void {
        super.getResp<SourcesResponse>(
            {
                endpoint: Endpoint.Sources,
            },
            callback
        );
    }

    public getNews(e: Event, callback: Callback<ArticlesResponse>): void {
        const newsContainer = e.currentTarget;
        const target = e.target;

        if (!(newsContainer instanceof HTMLElement) || !(target instanceof Node)) {
            return;
        }

        let node: Node | null = target;

        while (node !== null && node !== newsContainer) {
            if (node instanceof HTMLElement && node.classList.contains('source__item')) {
                const sourceId = node.getAttribute('data-source-id');
                if (sourceId !== null && newsContainer.getAttribute('data-source') !== sourceId) {
                    newsContainer.setAttribute('data-source', sourceId);
                    super.getResp<ArticlesResponse>(
                        {
                            endpoint: Endpoint.Everything,
                            options: {
                                sources: sourceId,
                            },
                        },
                        callback
                    );
                }
                return;
            }
            node = node.parentNode;
        }
    }
}

export default AppController;
