/**
 * دالة إرسال الإشعارات الفورية داخل المتصفح (PWA Notifications)
 * متوافقة تماماً مع معايير PWA وإشعارات المتصفح الحديثة
 */

export function sendPushNotification(title: string, bodyText: string): void {
  if (typeof window === 'undefined' || !("Notification" in window)) {
    console.log("متصفحك لا يدعم الإشعارات الفورية");
    return;
  }

  // نغمة تنبيه صوتية لطيفة (Audio Chime) تعمل تلقائياً دون ملفات خارجية
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, ctx.currentTime); // نغمة صول G5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.12); // نغمة دو C6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (err) {
    // ignore audio context restrictions before user interaction
  }

  // اهتزاز الهاتف عند وصول الإشعار في الأجهزة المدعومة
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {}
  }

  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body: bodyText,
        icon: "/assets/icon.png", // أيقونة التطبيق
        badge: "/assets/badge.png"
      });
    } catch (err) {
      // في بعض متصفحات الجوال الحديثة يتطلب النظام استدعاء showNotification عبر ServiceWorker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body: bodyText,
            icon: "/assets/icon.png",
            badge: "/assets/badge.png"
          } as unknown as NotificationOptions);
        }).catch(() => {});
      }
    }
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        try {
          new Notification(title, { 
            body: bodyText,
            icon: "/assets/icon.png",
            badge: "/assets/badge.png"
          });
        } catch {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body: bodyText,
                icon: "/assets/icon.png",
                badge: "/assets/badge.png"
              } as unknown as NotificationOptions);
            }).catch(() => {});
          }
        }
      }
    });
  }
}

// إتاحة الدالة مباشرة على كائن window لسهولة التجربة والاستدعاء
if (typeof window !== 'undefined') {
  (window as unknown as { sendPushNotification: typeof sendPushNotification }).sendPushNotification = sendPushNotification;
}
