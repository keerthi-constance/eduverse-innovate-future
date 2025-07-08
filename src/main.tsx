window.LUCID_WASM_PATH = "/cardano_multiplatform_lib_bg.wasm";
window.CARDANO_MESSAGE_SIGNING_WASM_PATH = "/cardano_message_signing_bg.wasm";
import '@emurgo/cardano-serialization-lib-browser';
import { createRoot } from 'react-dom/client';
import App from './App';
import { App as AntdApp } from 'antd';
import './index.css';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

createRoot(document.getElementById("root")!).render(
  <AntdApp>
    <App />
  </AntdApp>
);