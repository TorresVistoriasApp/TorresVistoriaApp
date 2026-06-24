import type { ReactElement } from "react";
import { ResponsiveContainer, type ResponsiveContainerProps } from "recharts";

type ChartResponsiveContainerProps = Omit<ResponsiveContainerProps, "children"> & {
  children: ReactElement;
};

/** ResponsiveContainer com dimensão inicial — evita gráfico vazio no primeiro paint mobile. */
export function ChartResponsiveContainer({ children, ...props }: ChartResponsiveContainerProps) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minWidth={0}
      debounce={50}
      initialDimension={{ width: 320, height: 220 }}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
}
