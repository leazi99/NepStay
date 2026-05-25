import React from 'react'
import { ChevronDown } from 'lucide-react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

const ProfileDropdown = ({
  isOpen,
  onToggle,
  avatar,
  companyName,
  email,
  role,
  isDark = false,
  onLogout
}) => {
  const navigate = useNavigate();

  const displayName = companyName || "User";
  const displayEmail = email || "";

  return <div className='relative'>
    <button
      onClick={onToggle}
      className={`flex items-center space-x-3 p-2 rounded-xl transition-colors duration-200 ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"}`}>
      {avatar ? (
        <img
          src={avatar}
          alt="Avatar"
          className='h-9 w-9 object-cover rounded-xl'
        />
      ) : (
        <div className='h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
          <span className='text-white font-semibold text-sm'>
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className='hidden sm:block text-left'>
        <p className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>{displayName}</p>
        <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          {role === 'hotelstaff' ? 'Hotel Staff' : 'Guest'}
        </p>
      </div>
      <ChevronDown className={`h-4 w-4 ${isDark ? "text-slate-400" : "text-gray-400"}`} />
    </button>
    {isOpen && (
      <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border py-2 z-50 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>

        <div className={`px-4 py-3 border-b ${isDark ? "border-slate-700" : "border-gray-100"}`}>
          <p className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>{displayName}
          </p>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{displayEmail}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(role === 'customer' ? '/profile' : '/hotel-profile')}
          className={`block w-full text-left px-4 py-2 text-sm transition-colors ${isDark ? "text-slate-200 hover:bg-slate-800" : "text-gray-700 hover:bg-gray-50"}`}>
          View Profile
        </button>

        <div className={`border-t mt-2 pt-2 ${isDark ? "border-slate-700" : "border-gray-100"}`}>
          <button
            type="button"
            onClick={onLogout}
            className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'
          >
            Sign Out
          </button>
        </div>
      </div>
    )}
  </div>
}

export default ProfileDropdown

ProfileDropdown.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  avatar: PropTypes.string,
  companyName: PropTypes.string,
  email: PropTypes.string,
  role: PropTypes.string,
  isDark: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
};
