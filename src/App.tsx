import * as React from 'react';
import { IAppProps } from './IAppProps';
import AppRouter from './approuter';
import './App.css'

export const spContext = React.createContext<any>(null);

export const App: React.FC<IAppProps> = ({
  sp,
  context
}) => {

  return (
    <spContext.Provider value={{ sp, context }}>
      <AppRouter />
    </spContext.Provider>
  );
};

export default App;
