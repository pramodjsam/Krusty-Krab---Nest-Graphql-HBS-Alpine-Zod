import { Order } from '@/generated/graphql';
import easyinvoice, { InvoiceData } from 'easyinvoice';
import { toBase64 } from './common';
import { notyNotification } from './notification';

export const getInvoice = async (order: Partial<Order>) => {
  const image = await toBase64(
    'https://res.cloudinary.com/cserver/image/upload/v1694358251/cserver/krusty_krab/uploads/android-chrome-192x192_v5qsxg.png',
  );
  const invoiceId = order.id;
  //   const shippingCharge = {
  //     quantity: order?.orderItem?.reduce((sum, item) => sum + item.quantity, 0),
  //     description: '****Shipping Charge ****',
  //     taxRate: 13,
  //     price: order.totalPrice,
  //   };
  const data: InvoiceData = {
    mode: 'development' as const,
    // documentTitle: 'Krusty Krab INVOICE', //Defaults to INVOICE
    settings: {
      currency: 'cad',
      taxNotation: 'Tax',
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
    },
    images: {
      // The logo on top of your invoice
      //   logo: 'https://public.budgetinvoice.com/img/logo_en_original.png',
      // The invoice background
      // background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
    },
    //   logo: "/images/pizza-logo.png", //or base64
    // "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg", //or base64 //img or pdf
    sender: {
      company: `Krusty Krab`,
      address: `200 Preston Pkwy`,
      zip: 'N3H 5N1',
      city: 'Cambridge',
      country: 'Canada',
    },
    client: {
      company: order?.user?.name,
      address: order.address,
      zip: order.zipCode,
      city: `${order.city}, ${order.province}`,
      country: 'Canada',
    },
    information: {
      // Invoice number
      number: `${invoiceId}`,
      // Invoice data
      date: `${new Date().toLocaleDateString('en-US')}`,
      // Invoice due date
      dueDate: `${new Date().toLocaleDateString('en-US')}`,
    },
    products: [
      ...(order?.orderItem?.map((item) => {
        return {
          quantity: item.quantity.toString(),
          description: `${item.product.name}`,
          taxRate: 13,
          price: item.price,
        };
      }) || []),
    ],
    bottomNotice:
      'This is auto generated invoice of your booking on Krusty Krab',
  };

  try {
    const result = await easyinvoice.createInvoice(data);
    easyinvoice.download(`invoice_${invoiceId}.pdf`, result.pdf);
  } catch (error) {
    console.log('ERROR', error);
    notyNotification('Server Error - Invoice Generation', 'error');
  }
};
