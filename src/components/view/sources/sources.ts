import './sources.css';
import { Source } from '../../types/newsApi';
import { getElement } from '../../utils/dom';

class Sources {
    public draw(data: Source[]): void {
        const fragment = document.createDocumentFragment();
        const sourceItemTemp = getElement<HTMLTemplateElement>('#sourceItemTemp');

        data.forEach((item) => {
            const sourceClone = document.importNode(sourceItemTemp.content, true);

            getElement('.source__item-name', sourceClone).textContent = item.name;
            getElement('.source__item', sourceClone).setAttribute('data-source-id', item.id);

            fragment.append(sourceClone);
        });

        getElement('.sources').append(fragment);
    }
}

export default Sources;
