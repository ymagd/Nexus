import React from 'react';
import Splash from '../screens/SplashScreen';
import Enzyme from 'enzyme';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Button } from 'native-base';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('WebView', () => 'WebView');

test('login button works', () => {
    const wrapper = shallow(<Splash/>);
    const clickMock = jest.fn();

    wrapper.instance().Login = clickMock;
    wrapper.find(Button).at(0).props().onPress();

    expect(wrapper.instance().Login).toHaveBeenCalled();
});