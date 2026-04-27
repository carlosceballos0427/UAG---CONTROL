import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 rounded-xl border border-red-200 m-4">
                    <h2 className="text-xl font-bold mb-4">⚠️ Algo salió mal al cargar el formulario</h2>
                    <details className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border border-red-100 overflow-auto max-h-96">
                        <summary className="cursor-pointer mb-2 font-semibold">Ver detalles del error</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Recargar Página
                    </button>
                    <button
                        onClick={() => this.props.onReset && this.props.onReset()}
                        className="mt-6 ml-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Volver al Inicio
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
