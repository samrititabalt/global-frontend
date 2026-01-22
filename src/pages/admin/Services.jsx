import React, { useState } from 'react';
import Layout from '../../components/Layout';
import hrServices from '../../data/hrServices';

const AdminServices = () => {
  const [openService, setOpenService] = useState(hrServices[0]?.name || null);

  return (
    <Layout title="Manage Services">
      <div className="space-y-4">
        {hrServices.map((service) => {
          const isOpen = openService === service.name;
          return (
            <div
              key={service.name}
              className="bg-white rounded-2xl shadow border border-gray-200"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenService(isOpen ? null : service.name)
                }
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {service.subServices.length} sub-service
                    {service.subServices.length > 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-gray-400 text-2xl leading-none">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.subServices.map((subService) => (
                      <div
                        key={subService}
                        className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary-500"></span>
                        <span className="text-sm text-gray-700">{subService}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default AdminServices;

