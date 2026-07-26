import React from 'react';
import { Info, AlertTriangle, CheckCircle, Flame, Lightbulb } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '@mui/material';

const typeConfig = {
  note: {
    icon: Info,
    bgLight: 'bg-gray-100',
    borderLight: 'border-gray-400',
    textLight: 'text-gray-800',
    iconColorLight: 'text-gray-600',
    bgDark: 'bg-gray-800/50',
    borderDark: 'border-gray-500',
    textDark: 'text-gray-200',
    iconColorDark: 'text-gray-400',
    label: 'NOTE'
  },
  tip: {
    icon: Lightbulb,
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-400',
    textLight: 'text-blue-900',
    iconColorLight: 'text-blue-600',
    bgDark: 'bg-blue-900/20',
    borderDark: 'border-blue-500/50',
    textDark: 'text-blue-200',
    iconColorDark: 'text-blue-400',
    label: 'TIP'
  },
  warning: {
    icon: AlertTriangle,
    bgLight: 'bg-yellow-50',
    borderLight: 'border-yellow-500',
    textLight: 'text-yellow-900',
    iconColorLight: 'text-yellow-600',
    bgDark: 'bg-yellow-900/20',
    borderDark: 'border-yellow-500/50',
    textDark: 'text-yellow-200',
    iconColorDark: 'text-yellow-400',
    label: 'WARNING'
  },
  important: {
    icon: Flame,
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-500',
    textLight: 'text-purple-900',
    iconColorLight: 'text-purple-600',
    bgDark: 'bg-purple-900/20',
    borderDark: 'border-purple-500/50',
    textDark: 'text-purple-200',
    iconColorDark: 'text-purple-400',
    label: 'IMPORTANT'
  },
  success: {
    icon: CheckCircle,
    bgLight: 'bg-green-50',
    borderLight: 'border-green-500',
    textLight: 'text-green-900',
    iconColorLight: 'text-green-600',
    bgDark: 'bg-green-900/20',
    borderDark: 'border-green-500/50',
    textDark: 'text-green-200',
    iconColorDark: 'text-green-400',
    label: 'SUCCESS'
  }
};

const Callout = ({ type = 'note', children }) => {
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  
  const config = typeConfig[type.toLowerCase()] || typeConfig.note;
  const Icon = config.icon;

  return (
    <div className={clsx(
      'my-6 flex rounded-lg border-l-4 p-4 shadow-sm transition-all duration-300 hover:shadow-md',
      isDark ? config.bgDark : config.bgLight,
      isDark ? config.borderDark : config.borderLight,
      isDark ? config.textDark : config.textLight
    )}>
      <div className={clsx("mr-3 mt-0.5 flex-shrink-0", isDark ? config.iconColorDark : config.iconColorLight)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="w-full">
        <div className={clsx("mb-1 font-bold tracking-wide text-xs", isDark ? config.iconColorDark : config.iconColorLight)}>
          {config.label}
        </div>
        <div className="prose prose-sm max-w-none text-current">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Callout;
