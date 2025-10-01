export async function ensurePushSubscription() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notifications/public-key`);
    if (!res.ok) return null;
    const { publicKey } = await res.json();

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const payload = {
      id: localStorage.getItem('pushSubId') || undefined,
      endpoint: sub.endpoint,
      keys: sub.toJSON().keys,
    };

    const sres = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!sres.ok) return null;
    const data = await sres.json();
    if (data.subscription_id) localStorage.setItem('pushSubId', data.subscription_id);
    return data.subscription_id;
  } catch (e) { return null; }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}