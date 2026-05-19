import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function FloatingSupport() {
  const [showZalo, setShowZalo] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Chào bạn! Mình là Trợ lý AI của MyHaUI ERP. Bạn cần hỗ trợ gì về Thời khóa biểu, Cơ sở vật chất, hay Quy trình duyệt NCKH?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Zalo Admin SĐT
  const zaloPhone = '0964919344';

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        setTimeout(() => {
          setChatMessages(prev => [...prev, { role: 'model', text: '⚠️ Lỗi: Chưa cấu hình VITE_GEMINI_API_KEY trong file .env. Vui lòng liên hệ Admin để thêm API Key.' }]);
          setIsTyping(false);
        }, 1000);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const systemPrompt = `Bạn là Trợ lý Ảo (AI Support) của hệ thống "MyHaUI ERP Portal" (Đại học Công nghiệp Hà Nội). 
Hệ thống này quản lý Thời khóa biểu, Quản lý tài sản (Phòng máy), và Quản lý mượn máy tính Nghiên cứu khoa học (NCKH).
Quy trình mượn máy NCKH: Sinh viên -> Giảng viên HD duyệt -> Quản lý Trung tâm duyệt.
Hãy trả lời các câu hỏi của người dùng một cách thân thiện, ngắn gọn và chính xác. Không bịa đặt thông tin ngoài hệ thống.`;

      const prompt = `${systemPrompt}\n\nNgười dùng hỏi: ${userMsg}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setChatMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 9999 }}>
        
        {/* Zalo Button */}
        <button 
          onClick={() => { setShowZalo(true); setShowChat(false); }}
          style={{ 
            width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#0068ff', color: 'white', 
            border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', 
            justifyContent: 'center', alignItems: 'center', fontSize: '24px', transition: 'transform 0.2s' 
          }}
          title="Liên hệ Zalo Admin"
        >
          💬
        </button>

        {/* AI Chat Button */}
        <button 
          onClick={() => { setShowChat(!showChat); setShowZalo(false); }}
          style={{ 
            width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #a41c2c, #f50057)', color: 'white', 
            border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', 
            justifyContent: 'center', alignItems: 'center', fontSize: '24px', transition: 'transform 0.2s' 
          }}
          title="Góp ý / Hỗ trợ AI"
        >
          🤖
        </button>
      </div>

      {/* Zalo Modal */}
      {showZalo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#0068ff', marginTop: 0 }}>Kết nối Zalo Admin</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Vui lòng quét mã QR bên dưới hoặc nhấn nút để mở ứng dụng Zalo.</p>
            
            {/* Zalo QR Placeholder - The user will upload their image here */}
            <div style={{ width: '200px', height: '200px', margin: '20px auto', border: '2px dashed #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '8px' }}>
              <img src="/zalo-qr.png" alt="Zalo QR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span style="color:#999">Ảnh QR Zalo<br/>(public/zalo-qr.png)</span>'; }} />
            </div>

            <a 
              href={`https://zalo.me/${zaloPhone}`} 
              target="_blank" rel="noreferrer"
              style={{ display: 'block', padding: '12px', backgroundColor: '#0068ff', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px' }}
            >
              Mở ứng dụng Zalo
            </a>
            <button onClick={() => setShowZalo(false)} style={{ padding: '8px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>Đóng lại</button>
          </div>
        </div>
      )}

      {/* AI Chat Window */}
      {showChat && (
        <div style={{ position: 'fixed', bottom: '100px', right: '30px', width: '350px', height: '500px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 10000, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #ddd' }}>
          <div style={{ background: 'linear-gradient(135deg, #a41c2c, #f50057)', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🤖</span> Gemini AI Support
            </div>
            <button onClick={() => setShowChat(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>

          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f9f9f9' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '3px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.role === 'user' ? 'Bạn' : 'AI Assistant'}
                </div>
                <div style={{ 
                  padding: '10px 15px', 
                  borderRadius: '16px', 
                  backgroundColor: msg.role === 'user' ? '#a41c2c' : 'white', 
                  color: msg.role === 'user' ? 'white' : '#333',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  border: msg.role === 'user' ? 'none' : '1px solid #eee',
                  lineHeight: '1.4'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
               <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                 <div style={{ padding: '10px 15px', borderRadius: '16px', backgroundColor: 'white', border: '1px solid #eee' }}>
                   <span className="typing-dots">Đang gõ...</span>
                 </div>
               </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '15px', background: 'white', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Nhập câu hỏi hoặc góp ý..." 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isTyping || !inputText.trim()}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: inputText.trim() ? '#a41c2c' : '#ccc', color: 'white', border: 'none', cursor: inputText.trim() ? 'pointer' : 'default', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
