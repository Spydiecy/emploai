interface OnrampURLParams {
  address: string;
  presetCryptoAmount?: number;
  redirectUrl?: string;
}

export const generateOnrampURL = ({
  address,
  presetCryptoAmount,
  redirectUrl,
}: OnrampURLParams): string => {
  // Use the direct App ID
  const appId = '58a3fa2e-617f-4198-81e7-096f5e498c00';
  
  // Create the addresses object with the correct network identifier
  const addresses = {
    [address]: ["FLOW"] // Use uppercase "FLOW" instead of "flow"
  };

  // Base URL for Coinbase Onramp
  const baseUrl = 'https://pay.coinbase.com/buy/select-asset';

  // Build URL with required parameters
  const params = new URLSearchParams();
  
  // Add required parameters
  params.append('appId', appId);
  params.append('addresses', JSON.stringify(addresses));
  params.append('assets', JSON.stringify(["FLOW", "USDC"])); // Add USDC as an option

  // Add optional parameters
  if (presetCryptoAmount) {
    params.append('presetCryptoAmount', presetCryptoAmount.toString());
  }

  if (redirectUrl) {
    params.append('redirectUrl', redirectUrl);
  }

  // Construct final URL
  const finalUrl = `${baseUrl}?${params.toString()}`;
  console.log('Generated URL:', finalUrl); // For debugging
  
  return finalUrl;
}; 