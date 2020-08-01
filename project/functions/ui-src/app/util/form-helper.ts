export class FormHelper {

  reset(form: HTMLFormElement) {
    const elements = Array.from(form.querySelectorAll('[name]'));
    elements.forEach((element) => {
      const type = element.getAttribute('type');
      switch (type) {
        case 'password':
        case 'email':
        case 'text':
          (element as HTMLInputElement).value = '';
          break;
        case 'number':
          (element as HTMLInputElement).value = '';
          break;
        case 'checkbox':
          (element as HTMLInputElement).checked = false;
          break;
        case 'json':
          (element as HTMLInputElement).dataset.value = '{}';
      }
    });
  }

  getJson(event: Event) {
    const form = event.target as HTMLFormElement;
    const elements = Array.from(form.querySelectorAll('[name]'));

    return elements.map(this.getValue)
      .reduce(this.reduceArrayToObject);
  }

  getJsonFromElement(form: HTMLFormElement) {
    const elements = Array.from(form.elements);

    return elements.map(this.getValue)
      .reduce(this.reduceArrayToObject);
  }

  isValid(event: Event) {
    const form = event.target as HTMLFormElement;

    const elements = Array.from(form.querySelectorAll('[name]')) as HTMLElement[];

    return elements.map(this.getValidity).filter((i) => {
      return i !== null;
    }).every((i) => {
      return i;
    });
  }

  isValidFromElement(form: HTMLFormElement) {
    const elements = Array.from(form.elements) as HTMLElement[];

    return elements
      .filter( (i: any) => i.type !== 'datetime-local')
      .map(this.getValidity).filter((i) => {
        return i !== null;
      }).every((i) => {
        return i;
      });
  }

  reduceArrayToObject(prev: any, current: any) {
    return Object.assign(current, prev);
  }

  submitFormListener(event: KeyboardEvent) {
    const submitKeys = ['Enter'];
    if (submitKeys.some((i) => i === event.code)) {
      // todo find a way to do a js submit safely.
      // this will not be caught by a submit event listener
      // (event.currentTarget as HTMLFormElement).submit();
    }
  }

  public getValidity(element: HTMLElement): boolean {
    const type = element.getAttribute('type');
    const dataType = element.dataset.type;
    const compare = dataType ? dataType : type;

    switch (compare) {
      case 'password':
      case 'text':
      case 'email':
      case 'number':
        return (element as HTMLInputElement).reportValidity();
      case 'checkbox':
      case 'switch':
        return true;
      case 'json':
        return !!element.dataset.value;
    }

    return false;
  }

  public markInputInvalid(event: Event) {
    const target = event.target as HTMLInputElement;
    target.setAttribute('invalid', '');
  }

  public markInputAsValid(event: Event) {
    const target = event.target as HTMLInputElement;
    target.removeAttribute('invalid');
  }

  public getValue(element: Element): any {
    const type = element.getAttribute('type');
    const key: string = element.getAttribute('name') as string;

    switch (type) {
      case 'password':
      case 'email':
      case 'datetime-local':
      case 'text':
        return {
          [key]: (element as HTMLInputElement).value
        };
      case 'number':
        return {
          [key]: +(element as HTMLInputElement).value
        };
      case 'checkbox':
      case 'switch':
        return {
          [key]: (element as HTMLInputElement).checked
        };
      case 'json':
        return {
          [key]: JSON.parse((element as HTMLInputElement).dataset.value || '{}')
        };
    }

    return null;
  }

  public leadingZeroString(number: number) {
    if (number > -10 && number < 10) {
      return `0${number}`
    }

    return `${number}`;
  }
}

export default new FormHelper();
