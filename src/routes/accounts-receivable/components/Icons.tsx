import type { ReactNode, SVGProps } from 'react';

const iconBase = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none'
};

const IconWrapper = ({
  children,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    className={className}
    {...props}
  >
    {children}
  </svg>
);

export const InvoiceIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M8 3h8l3 3v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6l3-3Z" {...iconBase} />
    <path d="M9 8h6M9 12h6M9 16h4" {...iconBase} />
  </IconWrapper>
);

export const CashIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" {...iconBase} />
    <circle cx="12" cy="12" r="3" {...iconBase} />
    <path d="M3 9h2M3 15h2M19 9h2M19 15h2" {...iconBase} />
  </IconWrapper>
);

export const AgingIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M4 19v-7l6-3 6 3 4-2" {...iconBase} />
    <path d="M12 5v4" {...iconBase} />
    <circle cx="12" cy="5" r="2" {...iconBase} />
  </IconWrapper>
);

export const CustomerIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <circle cx="12" cy="8" r="4" {...iconBase} />
    <path d="M5 20a7 7 0 0 1 14 0" {...iconBase} />
  </IconWrapper>
);

export const DisputeIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M4.5 4.5 12 2l7.5 2.5v7.5c0 5-3.5 7.5-7.5 9-4-1.5-7.5-4-7.5-9V4.5Z" {...iconBase} />
    <path d="M12 7v5" {...iconBase} />
    <circle cx="12" cy="16" r="1" {...iconBase} />
  </IconWrapper>
);

export const AutomationIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M4 12h3l2 5 4-10 2 5h5" {...iconBase} />
    <circle cx="5" cy="12" r="2" {...iconBase} />
    <circle cx="12" cy="7" r="2" {...iconBase} />
    <circle cx="19" cy="12" r="2" {...iconBase} />
  </IconWrapper>
);

export const ReportIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" {...iconBase} />
    <path d="M7 13v3M12 10v6M17 8v8" {...iconBase} />
  </IconWrapper>
);

export const SettingsIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <circle cx="12" cy="12" r="3" {...iconBase} />
    <path d="m19.4 15-.9 1.6a1 1 0 0 1-1.1.5l-1.8-.5a7.8 7.8 0 0 1-1.6.9l-.3 1.8a1 1 0 0 1-1 .8h-1.8a1 1 0 0 1-1-.8l-.3-1.8a7.8 7.8 0 0 1-1.6-.9l-1.8.5a1 1 0 0 1-1.1-.5L4.6 15a1 1 0 0 1 .2-1.1l1.3-1a7.8 7.8 0 0 1 0-1.8l-1.3-1A1 1 0 0 1 4.6 9l.9-1.6a1 1 0 0 1 1.1-.5l1.8.5a7.8 7.8 0 0 1 1.6-.9l.3-1.8a1 1 0 0 1 1-.8h1.8a1 1 0 0 1 1 .8l.3 1.8a7.8 7.8 0 0 1 1.6.9l1.8-.5a1 1 0 0 1 1.1.5l.9 1.6a1 1 0 0 1-.2 1.1l-1.3 1a7.8 7.8 0 0 1 0 1.8l1.3 1a1 1 0 0 1 .2 1.1Z" {...iconBase} />
  </IconWrapper>
);

export const SearchIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <circle cx="11" cy="11" r="6" {...iconBase} />
    <path d="m16.5 16.5 3 3" {...iconBase} />
  </IconWrapper>
);

export const SparkleIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M12 3v3M12 18v3M4.2 6.2l2.1 2.1M17.7 19.8l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.2l2.1-2.1" {...iconBase} />
    <circle cx="12" cy="12" r="3" {...iconBase} />
  </IconWrapper>
);

export const DownloadIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M12 3v12" {...iconBase} />
    <path d="m7 11 5 5 5-5" {...iconBase} />
    <path d="M5 19h14" {...iconBase} />
  </IconWrapper>
);

export const FilterIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" {...iconBase} />
  </IconWrapper>
);

export const LightningIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="m13 2-8 12h6l-2 8 8-12h-6l2-8Z" {...iconBase} />
  </IconWrapper>
);

export const ClockIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <circle cx="12" cy="12" r="8" {...iconBase} />
    <path d="M12 8v4l2.5 2.5" {...iconBase} />
  </IconWrapper>
);

export const AttachmentIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M16.5 6.5 8 15a3 3 0 0 0 4.2 4.2l6.3-6.3a4 4 0 0 0-5.6-5.6L7 13" {...iconBase} />
  </IconWrapper>
);

export const CheckCircleIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <circle cx="12" cy="12" r="9" {...iconBase} />
    <path d="m8.5 12.5 2.5 2.5 5-5" {...iconBase} />
  </IconWrapper>
);

export const ErrorIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <circle cx="12" cy="12" r="9" {...iconBase} />
    <path d="M12 7v5" {...iconBase} />
    <circle cx="12" cy="16" r="1" {...iconBase} />
  </IconWrapper>
);

export const UploadIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M12 21V9" {...iconBase} />
    <path d="m7 13 5-5 5 5" {...iconBase} />
    <path d="M5 5h14" {...iconBase} />
  </IconWrapper>
);

export const UserIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <circle cx="12" cy="8" r="3.5" {...iconBase} />
    <path d="M5 20a7 7 0 0 1 14 0" {...iconBase} />
  </IconWrapper>
);

export const TagIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <IconWrapper className={className} {...props}>
    <path d="M5 3h7l7 7-7 7-7-7V3Z" {...iconBase} />
    <circle cx="9" cy="7" r="1.5" {...iconBase} />
  </IconWrapper>
);
