export async function loadContentData() {
    try {
        const response = await fetch('data/content.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to load content data:', error);
        throw error;
    }
}

export async function loadChartData() {
    try {
        const response = await fetch('data/chart_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to load chart data:', error);
        throw error;
    }
}
