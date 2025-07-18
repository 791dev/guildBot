# 🎯 Discord Clan Tag Role Bot

> Automatically gives a special role to users who have your clan tag in their Discord username.

> Discord kullanıcı adında belirlediğiniz **clan tag** (etiket) varsa otomatik olarak özel rol veren sistem.

---

## 🧠 Features | Özellikler

- ✅ Checks all members of the server
- ✅ Gives role if username contains the tag
- ✅ Removes role if tag is removed
- ✅ Logs actions in a log channel with embeds
- ✅ Profile picture and timestamp included in embed
---------------------------------------------------------------------
- ✅ Sunucudaki tüm üyeleri tarar  
- ✅ Kullanıcı adında belirlenen tag varsa rol verir  
- ✅ Tag çıkarılırsa rolü geri alır  
- ✅ Embed olarak log kanalına bildirim yollar  
- ✅ Embed'de kullanıcı profil fotoğrafı ve saat bilgisi yer alır

---

## ⚙️ Configuration | Kurulum

`config.js` dosyasını düzenleyin:

```js
module.exports = {
  token: "",
  presence: ["Guild Manager", "YKT <3"], // Botun durumu
  familyRole: "1395567921161306253", // Clan rolü ID'si 
  logChannel: "1393329862890229923", // Log kanalı ID'si
  guildID: "1391766834868654203", // Sunucu ID'si
  channel: "1393329936483352596", // Ses kanalı ID'si
  dailyTimeout: 0.1, // Kaç saat aralıkla kontrol edilecek (0.1 = 10m, 1 = 1h)
  timeout: 2000, // Her kullanıcı için bekleme süresi (ms)
  debug: false, // Hata ayıklama modu
};
```
