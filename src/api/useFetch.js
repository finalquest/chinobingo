import { useEffect, useState } from 'react';
import apiCall from './api';

const useFetch = (url, resource, data, options) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const fetchData = async (localData) => {
    try {
      if (localData) {
        setResponse(localData);
        return;
      }
      const { response: responseData } = await apiCall(url, resource, data, options);
      setResponse(responseData);
    } catch (fetchError) {
      setError(fetchError);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return { response, error, fetchData };
};

export default useFetch;
