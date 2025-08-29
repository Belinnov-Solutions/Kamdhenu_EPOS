import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import PropTypes from 'prop-types';
import CommonFooter from '../../../core/common/footer/commonFooter';

// ---------- Child 1: Sales Details ----------
function SalesDetails({ period, groupBy = 'day' }) {
  const navigate = useNavigate();

  const periodLabel = useMemo(() => {
    const d = moment(period.date);
    if (groupBy === 'week') return `Week ${d.week()}, ${d.year()}`;
    if (groupBy === 'month') return d.format('MMMM YYYY');
    return d.format('YYYY/MM/DD');
  }, [period.date, groupBy]);

  const products = period.products || [];
  const productsByQty = useMemo(
    () => [...products].sort((a, b) => b.qtySold - a.qtySold),
    [products]
  );
  const productsByRevenue = useMemo(
    () => [...products].sort((a, b) => b.totalSalesAmount - a.totalSalesAmount),
    [products]
  );
  const topQty = useMemo(() => productsByQty.slice(0, 10), [productsByQty]);

  const qtyOptions = useMemo(() => ({
    chart: { type: 'bar', height: 300, toolbar: { show: false } },
    series: [{ name: 'Qty Sold', data: topQty.map(p => p.qtySold) }],
    xaxis: {
      categories: topQty.map(p => p.productName),
      labels: { rotate: -45, trim: true, hideOverlappingLabels: true, style: { fontSize: '12px' } }
    },
    dataLabels: { enabled: false },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
    grid: { borderColor: '#E5E7EB', strokeDashArray: 5 },
    tooltip: { y: { formatter: (val) => `${val}` } },
    colors: ['#1B84FF'],
  }), [topQty]);

  const revenueDonut = useMemo(() => ({
    chart: { type: 'donut', height: 300, toolbar: { show: false } },
    series: products.map(p => p.totalSalesAmount),
    labels: products.map(p => p.productName),
    dataLabels: { enabled: false },
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '55%' } } },
    tooltip: { y: { formatter: (val) => `$${Number(val).toFixed(2)}` } },
    colors: ['#1B84FF', '#F26522', '#FFC107', '#2DCB73', '#4B3088', '#177DBC', '#FF6F28', '#6B7280', '#9CA3AF', '#111827'],
  }), [products]);

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <h2 className="mb-1">Sales Details</h2>
            <p className="text-muted mb-0">
              For <strong>{periodLabel}</strong> ({groupBy})
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              <i className="ti ti-arrow-left me-1" /> Back
            </button>
          </div>
        </div>

        {/* Overview cards */}
        <div className="row">
          <div className="col-xl-4 col-sm-6 col-12 d-flex">
            <div className="card bg-primary sale-widget flex-fill">
              <div className="card-body d-flex align-items-center">
                <span className="sale-icon bg-white text-primary"><i className="ti ti-currency-dollar fs-24" /></span>
                <div className="ms-2">
                  <p className="text-white mb-1">Total Sales</p>
                  <h4 className="text-white mb-0">₹{Number(period.totalSalesAmount).toFixed(2)}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-sm-6 col-12 d-flex">
            <div className="card bg-teal sale-widget flex-fill">
              <div className="card-body d-flex align-items-center">
                <span className="sale-icon bg-white text-teal"><i className="ti ti-shopping-cart fs-24" /></span>
                <div className="ms-2">
                  <p className="text-white mb-1">Items Sold</p>
                  <h4 className="text-white mb-0">{period.itemsSold}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-sm-6 col-12 d-flex">
            <div className="card bg-orange sale-widget flex-fill">
              <div className="card-body d-flex align-items-center">
                <span className="sale-icon bg-white text-orange"><i className="ti ti-receipt fs-24" /></span>
                <div className="ms-2">
                  <p className="text-white mb-1">Orders</p>
                  <h4 className="text-white mb-0">{period.orders}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="row mt-4">
          <div className="col-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="mb-0">All Products in {periodLabel}</h5>
                {products.length > 0 && <span className="text-muted">Total: {products.length}</span>}
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ minWidth: 220 }}>Product</th>
                        <th className="text-end">Qty Sold</th>
                        <th className="text-end">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsByRevenue.length ? productsByRevenue.map((p) => (
                        <tr key={p.productId}>
                          <td>{p.productName}</td>
                          <td className="text-end">{p.qtySold}</td>
                          <td className="text-end">₹{Number(p.totalSalesAmount).toFixed(2)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3} className="text-center text-muted">No product data for this period.</td></tr>
                      )}
                    </tbody>
                    {productsByRevenue.length > 0 && (
                      <tfoot>
                        <tr>
                          <th>Total</th>
                          <th className="text-end">
                            {products.reduce((s, p) => s + (p.qtySold || 0), 0)}
                          </th>
                          <th className="text-end">
                            ₹{products.reduce((s, p) => s + (p.totalSalesAmount || 0), 0).toFixed(2)}
                          </th>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

         {/* Charts */}
        <div className="row mt-4">
          <div className="col-lg-7 d-flex">
            <div className="card flex-fill">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="mb-0">Top Products by Quantity</h5>
                <span className="badge bg-light text-dark">{topQty.length} shown</span>
              </div>
              <div className="card-body">
                {topQty.length
                  ? <ReactApexChart options={qtyOptions} series={qtyOptions.series} type="bar" height={300} />
                  : <p className="text-muted mb-0">No products in this period.</p>}
              </div>
            </div>
          </div>
          <div className="col-lg-5 d-flex">
            <div className="card flex-fill">
              <div className="card-header"><h5 className="mb-0">Revenue Share</h5></div>
              <div className="card-body">
                {products.length
                  ? <ReactApexChart options={revenueDonut} series={revenueDonut.series} type="donut" height={300} />
                  : <p className="text-muted mb-0">No revenue data.</p>}
              </div>
            </div>
          </div>
        </div>

      </div>
      <CommonFooter />
    </div>
  );
}

SalesDetails.propTypes = {
  period: PropTypes.shape({
    date: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]).isRequired,
    totalSalesAmount: PropTypes.number.isRequired,
    itemsSold: PropTypes.number.isRequired,
    orders: PropTypes.number.isRequired,
    products: PropTypes.arrayOf(PropTypes.shape({
      productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      productName: PropTypes.string.isRequired,
      qtySold: PropTypes.number.isRequired,
      totalSalesAmount: PropTypes.number.isRequired,
    })).isRequired,
  }).isRequired,
  groupBy: PropTypes.oneOf(['day', 'week', 'month']),
};

// ---------- Child 2: Original Admin Dashboard ----------
function AdminHomeDashboard() {
  // Static chart configs as consts (no hooks)
  const companyOptions = {
    chart: { height: 240, type: 'bar', toolbar: { show: false } },
    colors: ['#212529'],
    responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom', offsetX: -10, offsetY: 0 } } }],
    plotOptions: {
      bar: {
        borderRadius: 10,
        borderRadiusWhenStacked: 'all',
        horizontal: false,
        endingShape: 'rounded',
        colors: { backgroundBarColors: ['#f3f4f5'], backgroundBarOpacity: 0.5, hover: { enabled: true, borderColor: '#F26522' } }
      }
    },
    xaxis: { categories: ['M','T','W','T','F','S','S'], labels: { style: { colors: '#6B7280', fontSize: '13px' } } },
    yaxis: { labels: { offsetX: -15, show: false } },
    grid: { borderColor: '#E5E7EB', strokeDashArray: 5, padding: { left: -8 } },
    legend: { show: false },
    dataLabels: { enabled: false },
    fill: { opacity: 1 }
  };
  const companySeries = [{ name: 'Company', data: [40, 60, 20, 80, 60, 60, 60] }];

  const revenueOptions = {
    chart: { height: 230, type: 'bar', stacked: true, toolbar: { show: false } },
    colors: ['#FF6F28', '#F8F9FA'],
    responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom', offsetX: -10, offsetY: 0 } } }],
    plotOptions: { bar: { borderRadius: 5, borderRadiusWhenStacked: 'all', horizontal: false, endingShape: 'rounded' } },
    xaxis: { categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], labels: { style: { colors: '#6B7280', fontSize: '13px' } } },
    yaxis: { min: 0, max: 100, labels: { offsetX: -15, style: { colors: '#6B7280', fontSize: '13px' }, formatter: (v) => v + 'K' } },
    grid: { borderColor: 'transparent', strokeDashArray: 5, padding: { left: -8 } },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => val / 10 + ' k' } },
    fill: { opacity: 1 }
  };
  const revenueSeries = [
    { name: 'Income', data: [40,30,45,80,85,90,80,80,80,85,20,80] },
    { name: 'Expenses', data: [60,70,55,20,15,10,20,20,20,15,80,20] },
  ];

  const planOptions = {
    chart: { height: 240, type: 'donut', toolbar: { show: false } },
    colors: ['#FFC107', '#1B84FF', '#F26522'],
    labels: ['Enterprise', 'Premium', 'Basic'],
    plotOptions: { pie: { donut: { size: '50%', labels: { show: false }, borderRadius: 30 } } },
    stroke: { lineCap: 'round', show: true, width: 0, colors: '#fff' },
    dataLabels: { enabled: false },
    legend: { show: false },
    responsive: [{ breakpoint: 480, options: { chart: { height: 180 }, legend: { position: 'bottom' } } }]
  };
  const planSeries = [20, 60, 20];

  const sparkOpts = (color) => ({
    series: [{ name: 'Messages', data: [5, 10, 7, 5, 10, 7, 5] }],
    chart: { type: 'bar', width: 70, toolbar: { show: false }, zoom: { enabled: false }, dropShadow: { enabled: false }, sparkline: { enabled: true } },
    markers: { size: 0, colors: ['#F26522'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 7 } },
    plotOptions: { bar: { horizontal: false, columnWidth: '35%', endingShape: 'rounded' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2.5, curve: 'smooth' },
    colors: [color],
    xaxis: { categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'], labels: { show: false } },
    tooltip: { show: false, theme: 'dark', fixed: { enabled: false }, x: { show: false }, marker: { show: false } }
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-lg-flex align-items-center justify-content-between mb-4">
          <div><h2 className="mb-1">Welcome, Admin</h2></div>
          <ul className="table-top-head"><li /></ul>
        </div>

        {/* Cards Row */}
        <div className="row">
          {/* Total Companies */}
          <div className="col-xl-3 col-sm-6 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="avatar avatar-md bg-dark mb-3"><i className="ti ti-building fs-16" /></span>
                  <span className="badge bg-success fw-normal mb-3">+19.01%</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="mb-1">5468</h2>
                    <p className="fs-13">Total Companies</p>
                  </div>
                  <ReactApexChart options={sparkOpts('#FF6F28')} series={sparkOpts('#FF6F28').series} type="bar" width={70} />
                </div>
              </div>
            </div>
          </div>

          {/* Active Companies */}
          <div className="col-xl-3 col-sm-6 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="avatar avatar-md bg-dark mb-3"><i className="ti ti-carousel-vertical fs-16" /></span>
                  <span className="badge bg-danger fw-normal mb-3">-12%</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="mb-1">4598</h2>
                    <p className="fs-13">Active Companies</p>
                  </div>
                  <ReactApexChart options={sparkOpts('#4B3088')} series={sparkOpts('#4B3088').series} type="bar" width={70} />
                </div>
              </div>
            </div>
          </div>

          {/* Total Subscribers */}
          <div className="col-xl-3 col-sm-6 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="avatar avatar-md bg-dark mb-3"><i className="ti ti-chalkboard-off fs-16" /></span>
                  <span className="badge bg-success fw-normal mb-3">+6%</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="mb-1">3698</h2>
                    <p className="fs-13">Total Subscribers</p>
                  </div>
                  <ReactApexChart options={sparkOpts('#177DBC')} series={sparkOpts('#177DBC').series} type="bar" width={70} />
                </div>
              </div>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="col-xl-3 col-sm-6 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="avatar avatar-md bg-dark mb-3"><i className="ti ti-businessplan fs-16" /></span>
                  <span className="badge bg-danger fw-normal mb-3">-16%</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="mb-1">₹89,878,58</h2>
                    <p className="fs-13">Total Earnings</p>
                  </div>
                  <ReactApexChart options={sparkOpts('#2DCB73')} series={sparkOpts('#2DCB73').series} type="bar" width={70} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Companies / Revenue / Top Plans */}
        <div className="row">
          {/* Companies */}
          <div className="col-xxl-3 col-lg-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                <h5 className="mb-2">Companies</h5>
                <div className="dropdown mb-2">
                  <Link to="#" className="btn btn-white border btn-sm d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    <i className="ti ti-calendar me-1" /> This Week
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><Link to="#" className="dropdown-item rounded-1">This Month</Link></li>
                    <li><Link to="#" className="dropdown-item rounded-1">This Week</Link></li>
                    <li><Link to="#" className="dropdown-item rounded-1">Today</Link></li>
                  </ul>
                </div>
              </div>
              <div className="card-body">
                <ReactApexChart id="company-chart" options={companyOptions} series={companySeries} type="bar" height={240} />
                <p className="f-13 d-inline-flex align-items-center">
                  <span className="badge badge-success me-1">+6%</span> 5 Companies from last month
                </p>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="col-lg-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                <h5 className="mb-2">Revenue</h5>
                <div className="dropdown mb-2">
                  <Link to="#" className="btn btn-white border btn-sm d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    <i className="ti ti-calendar me-1" /> 2025
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><Link to="#" className="dropdown-item rounded-1">2024</Link></li>
                    <li><Link to="#" className="dropdown-item rounded-1">2025</Link></li>
                    <li><Link to="#" className="dropdown-item rounded-1">2023</Link></li>
                  </ul>
                </div>
              </div>
              <div className="card-body pb-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <div className="mb-1">
                    <h5 className="mb-1">₹45787</h5>
                    <p><span className="text-success fw-bold">+40%</span> increased from last year</p>
                  </div>
                  <p className="fs-13 text-gray-9 d-flex align-items-center mb-1">
                    <i className="ti ti-circle-filled me-1 fs-6 text-primary" /> Revenue
                  </p>
                </div>
                <ReactApexChart id="revenue-income" options={revenueOptions} series={revenueSeries} type="bar" height={230} />
              </div>
            </div>
          </div>

          {/* Top Plans */}
          <div className="col-xxl-3 col-xl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                <h5 className="mb-2">Top Plans</h5>
                <div className="dropdown mb-2">
                  <Link to="#" className="btn btn-white border btn-sm d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    <i className="ti ti-calendar me-1" /> This Month
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><Link to="#" className="dropdown-item rounded-1">This Month</Link></li>
                    <li><Link to="#" className="dropdown-item rounded-1">This Week</Link></li>
                    <li><Link to="#" className="dropdown-item rounded-1">Today</Link></li>
                  </ul>
                </div>
              </div>
              <div className="card-body">
                <ReactApexChart options={planOptions} series={planSeries} type="donut" height={240} />
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <p className="f-13 mb-0"><i className="ti ti-circle-filled text-primary me-1" /> Basic</p>
                  <p className="f-13 fw-medium text-gray-9">60%</p>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <p className="f-13 mb-0"><i className="ti ti-circle-filled text-warning me-1" /> Premium</p>
                  <p className="f-13 fw-medium text-gray-9">20%</p>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-0">
                  <p className="f-13 mb-0"><i className="ti ti-circle-filled text-info me-1" /> Enterprise</p>
                  <p className="f-13 fw-medium text-gray-9">20%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keep your other sections as needed */}
      </div>
      <CommonFooter />
    </div>
  );
}

// ---------- Parent: choose which view ----------
export default function SuperAdminDashboard() {
  const { state } = useLocation();
  const period = state?.periodData || null;
  const groupBy = state?.groupBy || 'day';

  return period ? <SalesDetails period={period} groupBy={groupBy} /> : <AdminHomeDashboard />;
}
