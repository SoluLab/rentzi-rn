import axios from 'axios';

const PINATA_JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNmYxNmI5Yi1jYjBjLTRlN2MtYWQzOS04MTc3MDMxYWJmMzgiLCJlbWFpbCI6InZpbWFsQHNvbHVsYWIuY28iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNjNjMmIxY2EyNjVkY2ExY2Q5N2MiLCJzY29wZWRLZXlTZWNyZXQiOiJkMDI3MmE0YjY5NThmN2E4NmZjOWMyZjIwYjMyZGQ3MDQzMTkzNjU5NDYwYjJhYWMxOWQ3OTAwMmM0YTQ3NmE0IiwiZXhwIjoxNzg2MDE3Njk5fQ.l_SOjwj60q4x4mx7CxIjL9NlvciL_J-UuWWcnhPWoFM'; // यहाँ अपना Pinata JWT Token डालें

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