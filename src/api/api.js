import param from 'jquery-param';

const ACTION_METHOD = {
  detail_local: 'GET',
  detail_remote: 'GET',
  commit: 'POST',
  commit_form: 'POST',
  delete: 'DELETE',
  update: 'PUT',
};

const verb = type => ACTION_METHOD[type] || 'GET';

const parseResponse = (response) => {
  let result;
  return response.text()
    .then((text) => {
      result = text;
      return JSON.parse(text);
    })
    .catch(() => result);
};

const checkStatus = (options = {}, response = {}) => {
  const { ok, statusText } = response;
  // const { onOk, handleError } = options;
  if (!ok) {
    return parseResponse(response)
      .then((responseError) => {
        const error = new Error(responseError.code || responseError.message || statusText);
        error.response = response;
        error.responseError = responseError;
        error.options = options;
        throw error;
      });
  }
  return response;
};

const filterSilent = (options = {}, error = {}) => {
  const { silent } = options;
  const exceptions = silent && silent.exceptions;
  const status = error.response && error.response.status;
  const foundException = exceptions && exceptions.includes(status);

  if (silent && !foundException) {
    return { error };
  }
  throw error;
};

const getErrorMessage = ({ responseError }) => {
  if (typeof (responseError) === 'string') {
    return responseError;
  }
  return responseError.message || 'unknown_error';
};

const getErrorCause = ({ responseError = {} }) => responseError.cause;

const handleNetworkError = (options = {}, error = {}) => {
  //     GLOBAL.tracking.error("unmanaged_req_error " + error.message, error);
  // const { operationError, operationErrorMessage, onOk } = options;
  const { operationError, operationErrorMessage } = options;
  if ((!error.stack || error.response) && error.responseError) {
    if (error.response.status === 401) {
      window.location.href = '/login';
      return;
    }
    const errorMessage = getErrorMessage(error);
    const errorCause = getErrorCause(error);
    const newError = error;
    newError.responseError = {
      ...error.responseError,
      message: error.response.status === 409
      || error.response.status === 422
      || error.response.status === 403
      || error.response.status === 500 ? errorMessage : 'unknown_error',
      cause: error.response.status === 409
      || error.response.status === 422
      || error.response.status === 403
      || error.response.status === 500 ? errorCause : 'unknown_error',
    };
    throw newError;
  }

  let code = error.message || 'unknown_error';
  if (code === 'Network request failed' && operationError) {
    code = operationErrorMessage || 'unknown_operation_error';
  }
  // const body = { code: message };
  // const errorData = { body, onOk };
  // sendError(errorData, options);

  const newError = error;
  newError.responseError = {
    message: code,
  };
  newError.options = options;
  throw newError;
};

const maybeRetry = (retryCallback, retryCount, options = {}, response = {}) => {
  const { shouldRetry, maxRetries } = options;
  const retryMax = maxRetries || 1;
  if (shouldRetry && retryCount < retryMax) {
    return Promise.resolve(shouldRetry(response))
      .then((res) => {
        if (!res) {
          return response;
        }
        return new Promise((resolve) => {
          setTimeout(() => {
            const maybe = maybeRetry.bind(this, retryCallback, retryCount + 1, options);
            return retryCallback()
              .then(maybe)
              .then(resolve);
          }, 500 * retryCount);
        });
      });
  }
  return response;
};

const sendAny = (url, method = 'GET', commonHeaders, options = {}, body, credentials = 'include') => {
  const { headers: customHeaders, timeout = 30000 } = options;
  const headers = { ...commonHeaders, ...customHeaders };
  const config = {
    method,
    headers,
    body,
  };
  const delay = () => new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error('Network request failed')), timeout));
  return Promise.race([fetch(url, config), delay()])
    .catch((err) => {
      const error = err;
      error.url = url;
      error.options = options;
      throw error;
    });
};

const sendJson = (baseUrl, method = 'GET', options = {}, jsonBody, credentials = 'include') => {
  let headers = {
    accept: 'application/json',
    'Cache-Control': 'no-cache',
  };
  if (!options.multipart) {
    headers = { ...headers, 'Content-Type': 'application/json' };
  }
  const needBodyAsParams = jsonBody && method === 'GET';
  const url = needBodyAsParams ? `${baseUrl}?${param(jsonBody).split('%5B%5D').join('')}` : baseUrl;
  let body = jsonBody;
  if (!options.multipart) {
    body = needBodyAsParams ? undefined : JSON.stringify(jsonBody);
  }
  return sendAny(url, method, headers, options, body, credentials);
};

const sendString = (baseUrl, method = 'GET', options = {}, txtBody, credentials = 'include') => {
  const headers = {
    accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded ; charset=UTF-8',
    'Cache-Control': 'no-cache',
  };
  const needBodyAsParams = txtBody && method === 'GET';
  const url = needBodyAsParams ? `${baseUrl}?${txtBody}` : baseUrl;
  const body = needBodyAsParams ? undefined : txtBody;
  return sendAny(url, method, headers, options, body, credentials);
};

const call = (url, method = 'GET', options = {}, body, credentials = 'include') => {
  const { content, formatter } = options;
  const resolver = formatter || (response => response);
  const sendContent = content === 'text' ? sendString : sendJson;
  const send = sendContent.bind(this, url, method, options, body, credentials);
  const maybe = maybeRetry.bind(this, send, 0, options);
  return send()
    .then(maybe)
    .then(checkStatus.bind(this, options))
    .then(parseResponse)
    .then(resolver)
    .then(response => ({ response }))
    .catch(handleNetworkError.bind(this, options))
    .catch(filterSilent.bind(this, options));
};

const fullPath = (url, resource, options = {}) => {
  const { resourcePrefix } = options;
  const prefix = resourcePrefix || '';
  return `${url}${prefix}${resource}`;
};

const apiCall = (url, resource, data = undefined, options = {}) => {
  const { type } = options;
  const path = fullPath(url, resource, options);
  const method = verb(type);
  return call(path, method, options, data);
};

export default apiCall;
