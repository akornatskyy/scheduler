import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

global.resolvePromise = (data) => () => {
  return {
    then: (f) => {
      f(data);
      return {
        catch: () => {}
      };
    }
  };
};

global.rejectPromise = (e) => () => {
  return {
    then: () => {
      return {
        catch: (f) => f(e)
      };
    }
  };
};
