import axios from 'axios';

// Pinata JWT Token
const PINATA_JWT = 'Bearer  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0ODRjODdjNC01YzdkLTRhNzUtODgzZi03MzhjYjYzMGJjYmMiLCJlbWFpbCI6InBoaWxsaXAucmF0aGVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxOTcyNzM1M2U3ZTlkNTNkYWU2YyIsInNjb3BlZEtleVNlY3JldCI6ImQzNDMwYzBhYTgwN2RhNTJjNmMxMWM0MjZiYzg5NTEzNDdjMjQyYzBlMjM0Yzc4Y2YwYzA1MzYzZWM1ZGYxZGEiLCJleHAiOjE3ODYxMzE0ODl9.XqyzHOV3pMuG3LC7s564myCsC3QYGM6SkgM9H6TsgWQ'; 


/**
 
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
        Authorization: PINATA_JWT,
      },
    });
    
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  } catch (err: any) {
    console.error('Pinata upload error:', err?.response?.data || err.message);
    throw new Error('Failed to upload file to IPFS');
  }
};