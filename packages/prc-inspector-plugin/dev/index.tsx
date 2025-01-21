import React from 'react';
import ReactDOM from 'react-dom/client';
import { loadPlugin } from '@shinda-sakana/pluggable-react-component';
import Component from './Component';
import InspectorPlugin from '@/index';

const root = ReactDOM.createRoot(document.getElementById('root'));

const PluggedComponent = loadPlugin(Component, [
  InspectorPlugin()
]);

function App() {
  return (
    <PluggedComponent />
  );
}

root.render(<App />);
