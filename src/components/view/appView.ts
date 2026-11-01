import News from './news/news';
import Sources from './sources/sources';
import { ArticlesResponse, SourcesResponse } from '../types/newsApi';

export class AppView {
    private readonly news: News;
    private readonly sources: Sources;

    constructor() {
        this.news = new News();
        this.sources = new Sources();
    }

    public drawNews(data: Partial<ArticlesResponse>): void {
        const values = data?.articles ? data?.articles : [];
        this.news.draw(values);
    }

    public drawSources(data: Partial<SourcesResponse>): void {
        const values = data?.sources ? data?.sources : [];
        this.sources.draw(values);
    }
}

export default AppView;
