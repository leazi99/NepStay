import React from 'react'
import{Loader2} from 'lucide-react'


const Button = ({
  children,
  variant='primary',
  size='md',
  isLoading=false,
  className='',
  ...props
}) => {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="spinner" size={16}/>}
      {children}
      
    </button>
  )
}

export default Button
