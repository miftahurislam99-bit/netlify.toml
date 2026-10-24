exports.handler = async (event, context) => {
  const { url, validate } = event.queryStringParameters || {};

  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ error: 'URL প্রয়োজন' }) };
  }

  try {
    if (validate) {
      const res = await fetch(url, { method: 'HEAD' });
      const size = res.headers.get('content-length');
      
      if (size && parseInt(size) > 6000000) {
         return { statusCode: 400, body: JSON.stringify({ error: 'ফাইলটি ৬ মেগাবাইটের বেশি, Netlify ফ্রি প্ল্যানে এটি সাপোর্ট করে না।' }) };
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          sizeMB: size ? (size / 1024 / 1024).toFixed(2) : 'অজানা'
        })
      };
    } else {
      const res = await fetch(url);
      
      if (!res.ok) throw new Error('ফাইলটি পাওয়া যায়নি');
      
      const arrayBuffer = await res.arrayBuffer();
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment; filename="downloaded-app"'
        },
        body: Buffer.from(arrayBuffer).toString('base64'),
        isBase64Encoded: true
      };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'সার্ভার এরর! ফাইলটি ডাউনলোড করা যাচ্ছে না।' }) };
  }
};
