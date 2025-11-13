import React from 'react';

interface ProfileProps {
  user: {
    name: string;
    handle: string;
    avatar: string;
  }
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="text-center hidden md:block">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <div className="absolute inset-0 bg-cyan rounded-full animate-pulse opacity-50"></div>
        <img 
          src={user.avatar} 
          alt="Trader Avatar" 
          className="w-24 h-24 rounded-full relative border-2 border-cyan/50"
        />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{user.name}</h3>
        <p className="text-sm text-text-secondary">{user.handle}</p>
      </div>
    </div>
  );
};

export default Profile;
