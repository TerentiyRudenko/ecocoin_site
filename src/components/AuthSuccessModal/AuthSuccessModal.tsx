// import React from 'react';

// interface AuthSuccessModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   userId: string;
//   username: string;
// }

// const AuthSuccessModal: React.FC<AuthSuccessModalProps> = ({ 
//   isOpen, 
//   onClose, 
//   userId, 
//   username 
// }) => {
//   if (!isOpen) return null;

//   const profileLink = `https://ecocoin.top/tgID=${userId}`;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg max-w-md w-full">
//         <h2 className="text-2xl font-bold mb-4">✅ Authorization Successful</h2>
//         <p className="mb-2">Welcome, <b>@{username}</b>!</p>
//         <p className="mb-4">Your Telegram ID: <code>{userId}</code></p>
        
//         <div className="mb-4 p-3 bg-gray-100 rounded">
//           <p className="font-semibold">Your unique link:</p>
//           <a 
//             href={profileLink} 
//             className="text-blue-500 break-all"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             {profileLink}
//           </a>
//         </div>

//         <button
//           onClick={onClose}
//           className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
//         >
//           Continue
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AuthSuccessModal;