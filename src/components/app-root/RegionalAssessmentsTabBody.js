import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { regionalAssessmentRegions } from '../../utils/regions';
import { regionId } from '../../utils/regions';
import T from '../../temporary/external-text';
import axios from 'axios';
import urljoin from 'url-join';

export const fetchAssessmentPDF = (region) => {
    const pdfUrl = urljoin(
        process.env.REACT_APP_REGIONAL_ASSESSMENTS_URL,
        `${regionId(region)}.pdf`
    );

    return axios
        .get(pdfUrl, { responseType: 'blob' }) // Preserve binary 
        .then(response => {
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(`Failed to fetch PDF: ${response.statusText}`);
            }
        });
};

export default function RegionalAssessmentsTabBody({ regionOpt }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState(null);

    const context = useContext(T.contextType);

    const getConfig = (path) => T.get(context, path, {}, 'raw');

    const handleDownload = async () => {
        setIsDownloading(true);
        setError(null);
        // <a href="file_path" download="file_name">Download</a>
        try {
            const pdfBlob = await fetchAssessmentPDF(regionOpt.value);
            const url = window.URL.createObjectURL(new Blob([pdfBlob]));
            const link = document.createElement('a'); // an anchor, <a> 
            link.href = url;
            link.setAttribute(
                'download',
                `${regionId(regionOpt.value)}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to download the assessment PDF.');
        } finally {
            setIsDownloading(false);
        }
    };

    const isRegionValid = regionOpt && regionalAssessmentRegions[regionId(regionOpt.value)];

    return (
        <div style={{ padding: '20px' }}>
            <h2>{getConfig('tabs.regional_assessments.label')}</h2>
            <p>
                {getConfig('tabs.regional_assessments.prologue')}
            </p>
            {regionOpt && (
                <div style={{ marginTop: '20px' }}>
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloading || !isRegionValid}
                        variant="primary"
                    >
                        {isDownloading
                            ? 'Downloading...'
                            : isRegionValid
                                ? `Download Assessment for region: ${regionalAssessmentRegions[regionId(regionOpt.value)]}`
                                : 'Assessment Not Available'}
                    </Button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            )}
        </div>
    );
}

RegionalAssessmentsTabBody.propTypes = {
    regionOpt: PropTypes.object,
};
