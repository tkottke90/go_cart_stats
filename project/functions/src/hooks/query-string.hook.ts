import { IContext } from '../interfaces/routing.interfaces';

/*

Examples:
  ..?name=Thomas        => { name: "Thomas" }
  ..?number[number]=19  => { number: { number: "19 " } }
  ..?age[gt][number]=29 => { number: { gt: { number: "19 " } } }

*/

const convertParam = (type: string, value: string) => {
  let output: string | boolean | number = '';
  let retainStructure = true;
  
  switch(type) {
    case 'number':
      output = parseFloat(value);
      retainStructure = false;
    case 'boolean':
      output = value === 'true';
      retainStructure = false;
    default:
      output = value;
  }

  return { value: output, retainStructure };
}

const iterateOverObject = (key: string, param: any) => {
  if (typeof param === 'object') {
    const keys = Object.keys(param);

    let output = { ...param };
    keys.forEach( k => {
      const { value, retainStructure } = iterateOverObject(k, param[key]);

      if (retainStructure) {
        output[k] = value;
      } else {
        output = value;
      }
    });

    return { value: output, retainStructure: true };
  }

  return convertParam(key, param)  ;
}

export default function () {
  return async (context: IContext) => {
    const { value, } = iterateOverObject('', context.query);
    context.query = value;

    // console.dir(context.query);

    // context.error = new Error('Test');
    return context;
  };
}

export {
  iterateOverObject
}