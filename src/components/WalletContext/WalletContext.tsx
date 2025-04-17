import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Импортируйте стили для UI кошелька
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProps {
  children: ReactNode;
}

export const WalletContext: FC<WalletContextProps> = ({ children }) => {
  // Выберите сеть: devnet, testnet или mainnet-beta
  const network = WalletAdapterNetwork.Devnet;

  // Настройка конечной точки для Solana
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Список поддерживаемых кошельков
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};