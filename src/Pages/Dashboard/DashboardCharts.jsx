import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import useDashboardGraficas from "./useDashboardGraficas";

export default function DashboardCharts() {
    const { gastosCategoria, flujoCaja, loading } = useDashboardGraficas();

    if (loading) {
        return (
            <p className="text-center text-gray-400 py-10">Cargando gráficas...</p>
        );
    }

    const nivoTheme = {
        text: {
            fontFamily: "inherit",
        },
        tooltip: {
            container: {
                background: "#1f2937",
                color: "#fff",
                fontSize: "12px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
        },
    };

    return (
        <div className="space-y-4">
            {/* Tarjeta 1: Gastos por categoría */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                    Gastos por categoría (Mes actual)
                </h3>
                <div className="h-[250px]">
                    <ResponsivePie
                        data={gastosCategoria || []}
                        id="nombre"
                        value="valor"
                        innerRadius={0.75}
                        padAngle={2}
                        cornerRadius={4}
                        activeOuterRadiusOffset={8}
                        colors={["#2c295a", "#433e85", "#5b54b3", "#7a73e0", "#a29bfe"]}
                        enableArcLinkLabels={false}
                        enableArcLabels={false}
                        theme={nivoTheme}
                        motionConfig="gentle"
                        valueFormat={value => `$${Number(value).toFixed(2)}`}
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    />
                </div>
            </div>

            {/* Tarjeta 2: Flujo de caja */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                    Flujo de caja
                </h3>
                <div className="h-[250px]">
                    <ResponsiveBar
                        data={flujoCaja || []}
                        keys={["ingresos", "egresos"]}
                        indexBy="name"
                        groupMode="grouped"
                        padding={0.3}
                        borderRadius={4}
                        colors={({ id }) => (id === "ingresos" ? "#10b981" : "#ef4444")}
                        enableLabel={false}
                        enableGridX={false}
                        axisLeft={{
                            tickSize: 0,
                            tickPadding: 8,
                            axisLine: false,
                        }}
                        axisBottom={{
                            tickSize: 0,
                            tickPadding: 8,
                            axisLine: false,
                        }}
                        theme={nivoTheme}
                        motionConfig="gentle"
                        valueFormat={value => `$${Number(value).toFixed(2)}`}
                        margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
                    />
                </div>
            </div>
        </div>
    );
}
