// 这是一个封装了 fetch 的函数，可以放在你的项目中，比如 lib/apiClient.ts

export async function fetchWithAuth(url:string, options = {}) {
  // 1. 正常发起请求
  let response = await fetch(url, options);

  // 2. 如果响应是 401 (Unauthorized)，并且 Access Token 确实过期了
  //    (你可以通过特定的错误码来判断，这里为简化，直接判断状态码)
  if (response.status === 401) {
    console.log("Access token expired or invalid. Attempting to refresh...");

    // 3. 调用 /api/auth/refresh 接口
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
    });

    // 4. 如果刷新成功...
    if (refreshResponse.ok) {
      console.log("Token refreshed successfully. Retrying the original request...");
      // ...服务器会自动在浏览器中设置新的 access_token cookie
      
      // 5. 重新发起刚才失败的那个请求
      // 浏览器会自动带上新的 cookie，所以这次请求应该会成功
      response = await fetch(url, options);
      
    } else {
      // 6. 如果刷新也失败了，说明 Refresh Token 也过期了或无效
      //    这时就真的需要用户重新登录了
      console.log("Failed to refresh token. Redirecting to login.");
      // window.location.href = '/login'; // 重定向到登录页
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }
  }

  return response;
}

// 使用示例：
// 在你的组件中，用 fetchWithAuth 替代 fetch
// fetchWithAuth('/api/data').then(res => res.json()).then(data => console.log(data));