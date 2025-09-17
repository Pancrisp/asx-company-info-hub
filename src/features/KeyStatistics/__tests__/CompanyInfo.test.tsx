import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompanyInfo from '../CompanyInfo';
import { mockCompanyData, mockLongCompanyData, mockShortCompanyData, mockEmptyCompanyData } from './testUtils';

describe('CompanyInfo', () => {
  describe('rendering conditions', () => {
    it('should render null when no company data provided', () => {
      const { container } = render(<CompanyInfo companyData={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render null when company data has no company_info', () => {
      const { container } = render(<CompanyInfo companyData={mockEmptyCompanyData} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render company info when data is provided', () => {
      render(<CompanyInfo companyData={mockCompanyData} />);
      expect(screen.getByText(mockCompanyData.company_info)).toBeInTheDocument();
    });
  });

  describe('text truncation', () => {
    it('should not show read more button for short text', () => {
      render(<CompanyInfo companyData={mockShortCompanyData} />);
      expect(screen.getByText(mockShortCompanyData.company_info)).toBeInTheDocument();
      expect(screen.queryByText('Read more')).not.toBeInTheDocument();
    });

    it('should show truncated text with read more button for long text', () => {
      render(<CompanyInfo companyData={mockLongCompanyData} />);

      const expectedTruncated = mockLongCompanyData.company_info.substring(0, 200).trim() + '...';
      expect(screen.getByText(expectedTruncated)).toBeInTheDocument();
      expect(screen.getByText('Read more')).toBeInTheDocument();
    });

    it('should show full text when read more is clicked', () => {
      render(<CompanyInfo companyData={mockLongCompanyData} />);

      const readMoreButton = screen.getByText('Read more');
      fireEvent.click(readMoreButton);

      expect(screen.getByText(mockLongCompanyData.company_info)).toBeInTheDocument();
      expect(screen.getByText('Read less')).toBeInTheDocument();
    });

    it('should truncate text again when read less is clicked', () => {
      render(<CompanyInfo companyData={mockLongCompanyData} />);

      const readMoreButton = screen.getByText('Read more');
      fireEvent.click(readMoreButton);

      const readLessButton = screen.getByText('Read less');
      fireEvent.click(readLessButton);

      const expectedTruncated = mockLongCompanyData.company_info.substring(0, 200).trim() + '...';
      expect(screen.getByText(expectedTruncated)).toBeInTheDocument();
      expect(screen.getByText('Read more')).toBeInTheDocument();
    });
  });

  describe('accessibility and formatting', () => {
    it('should preserve whitespace and line breaks in text', () => {
      const dataWithNewlines = {
        ticker: 'TEST',
        company_info: 'Line 1\n\nLine 2\nLine 3'
      };

      const { container } = render(<CompanyInfo companyData={dataWithNewlines} />);
      const text = container.querySelector('p');

      expect(text).toBeInTheDocument();
      expect(text?.textContent).toBe(dataWithNewlines.company_info);
    });

    it('should have accessible button for read more functionality', () => {
      render(<CompanyInfo companyData={mockLongCompanyData} />);

      const button = screen.getByRole('button', { name: 'Read more' });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });
  });

  describe('edge cases', () => {
    it('should handle text exactly 200 characters', () => {
      const exactly200Chars = 'A'.repeat(200);
      const companyData = {
        ticker: 'TEST',
        company_info: exactly200Chars
      };

      render(<CompanyInfo companyData={companyData} />);
      expect(screen.getByText(exactly200Chars)).toBeInTheDocument();
      expect(screen.queryByText('Read more')).not.toBeInTheDocument();
    });

    it('should handle text with 201 characters', () => {
      const over200Chars = 'A'.repeat(201);
      const companyData = {
        ticker: 'TEST',
        company_info: over200Chars
      };

      render(<CompanyInfo companyData={companyData} />);
      const expectedTruncated = 'A'.repeat(200) + '...';
      expect(screen.getByText(expectedTruncated)).toBeInTheDocument();
      expect(screen.getByText('Read more')).toBeInTheDocument();
    });

    it('should handle text with trailing whitespace correctly', () => {
      const textWithWhitespace = 'A'.repeat(195) + '     ';
      const companyData = {
        ticker: 'TEST',
        company_info: textWithWhitespace
      };

      const { container } = render(<CompanyInfo companyData={companyData} />);
      const text = container.querySelector('p');

      expect(text).toBeInTheDocument();
      expect(text?.textContent).toBe(textWithWhitespace);
      expect(screen.queryByText('Read more')).not.toBeInTheDocument();
    });
  });
});