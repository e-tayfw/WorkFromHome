import { FC, PropsWithChildren } from "react";

interface TextStylesProps {
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Display: FC<PropsWithChildren & TextStylesProps> = ({
  children,
  className,
  onClick,
  style,
}) => {
  return (
    <p
      className={`text-[50px] leading-[60px] lg:text-[80px] lg:leading-[95px] ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </p>
  );
};

const H1: FC<PropsWithChildren & TextStylesProps> = ({
  children,
  className,
  onClick,
  style,
}) => {
  return (
    <h1
      className={`text-[32px] leading-[40px] lg:text-[36px] lg:leading-[36px] ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </h1>
  );
};

const H2: FC<PropsWithChildren & TextStylesProps> = ({
  children,
  className,
  onClick,
  style,
}) => {
  return (
    <h2
      className={`text-[28px] leading-[36px] lg:text-[32px] lg:leading-[44px] ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </h2>
  );
};

const H3: FC<PropsWithChildren & TextStylesProps> = ({
  children,
  className,
  onClick,
  style,
}) => {
  return (
    <h3
      className={`text-[20px] leading-[32px] lg:text-[24px] lg:leading-[36px] ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </h3>
  );
};

const Body: FC<PropsWithChildren & TextStylesProps> = ({
  children,
  className,
  onClick,
  style,
}) => {
  return (
    <p
      className={`text-[16px] leading-[24px] tracking-wide ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </p>
  );
};

const BodyLarge: FC<PropsWithChildren & TextStylesProps> = ({
  children,
  className,
  onClick,
  style,
}) => {
  return (
    <p
      className={`text-[18px] leading-[24px] tracking-wide ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </p>
  );
};

const BodySmall: FC<PropsWithChildren & TextStylesProps> = ({
  children,
  className,
  onClick,
  style,
}) => {
  return (
    <p
      className={`text-[14px] leading-[24px] tracking-wide ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </p>
  );
};

const Label: FC<PropsWithChildren & TextStylesProps> = ({
  children,
  className,
  onClick,
  style,
}) => {
  return (
    <p
      className={`text-[14px] leading-[20px] tracking-wide ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </p>
  );
};

export { Display, H1, H2, H3, Body, BodySmall, BodyLarge, Label };
