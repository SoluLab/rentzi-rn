import axios from 'axios';

// Pinata API credentials
const PINATA_API_KEY = '19727353e7e9d53dae6c';
const PINATA_SECRET_API_KEY = 'd3430c0aa807da52c6c11c426bc8951347c242c0e234c78cf0c05363ec5df1da';

/**
 * Uploads a file to IPFS using Pinata
 * @param file { uri, name, type } - React Native document/file object
 * @returns {Promise<string>} - IPFS gateway URL
 */
export const uploadToPinata = async (file: { uri: string; name: string; type: string; }) => {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const data = new FormData();
  data.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);

  try {
    const res = await axios.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
    });
    
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  } catch (err: any) {
    console.error('Pinata upload error:', err?.response?.data || err.message);
    throw new Error('Failed to upload file to IPFS');
  }
};