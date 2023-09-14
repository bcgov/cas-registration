import Head from 'next/head'
import App from '@/app/App'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { wrapper } from '../app/store'
import { AppProps } from 'next/app'

// const root = ReactDOM.createRoot(document.getElementById('root') as Element)

// root.render(
//   <Provider store={store}>
//     <React.StrictMode>
//       <Head>
//         <title>CAS Registration App</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//       </Head>
//       <App />
//     </React.StrictMode>
//   </Provider>
// )

function RegistrationApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default wrapper.withRedux(RegistrationApp)