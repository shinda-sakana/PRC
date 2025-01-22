import React from 'react';
import ReactDOM from 'react-dom/client';
import { loadPlugin } from '@shinda-sakana/pluggable-react-component';
import InspectorPlugin from '@shinda-sakana/prc-inspector-plugin';
import Component from './Component';

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
