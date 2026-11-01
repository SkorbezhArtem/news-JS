export function getElement<T extends Element = Element>(selector: string, parent: ParentNode = document): T {
    const element = parent.querySelector<T>(selector);

    if (element === null) {
        throw new Error(`Element not found: ${selector}`);
    }

    return element;
}
