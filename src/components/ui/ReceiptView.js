import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Print from 'expo-print';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from './Icon';
import AnimatedButton from './AnimatedButton';
import { alertService } from '../../services/alertService';

const ReceiptView = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, spacing, borderRadius, typography } = useTheme();
  const [printing, setPrinting] = useState(false);
  
  const order = route?.params?.order || null;

  const handleClose = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  if (!order) {
    return null;
  }

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} ${timeStr}`;
    } catch (error) {
      return dateString;
    }
  };

  // Generate HTML for print
  const generateReceiptHTML = () => {
    const orderDate = formatDateTime(order.createdAt || order.timestamp || order.paidAt);
    const paymentMethod = order.paymentMethod || 'cash';
    const orderType = order.orderType || 'dine-in';
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt - Order #${order.id || 'N/A'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #000;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }
          .header h1 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
            letter-spacing: 1px;
          }
          .header p {
            font-size: 11px;
            color: #666;
          }
          .section {
            margin-bottom: 15px;
          }
          .section-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11px;
          }
          .order-info-label {
            font-weight: 600;
          }
          .items {
            margin-top: 10px;
          }
          .item {
            margin-bottom: 12px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #ddd;
          }
          .item:last-child {
            border-bottom: none;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .item-name {
            font-weight: bold;
            font-size: 12px;
            flex: 1;
          }
          .item-qty {
            font-weight: bold;
            font-size: 11px;
            margin-left: 10px;
          }
          .item-price {
            font-size: 11px;
            font-weight: 600;
            margin-left: 10px;
          }
          .addon {
            font-size: 10px;
            color: #555;
            margin-left: 15px;
            margin-top: 3px;
          }
          .special-instructions {
            font-size: 10px;
            color: #666;
            font-style: italic;
            margin-left: 15px;
            margin-top: 5px;
          }
          .totals {
            margin-top: 15px;
            border-top: 2px dashed #000;
            padding-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 11px;
          }
          .total-row.final {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 5px;
          }
          .total-label {
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px dashed #000;
            font-size: 10px;
            color: #666;
          }
          .payment-badge {
            display: inline-block;
            padding: 3px 8px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ClickSiLog</h1>
          <p>Restaurant & Ordering System</p>
        </div>

        <div class="section">
          <div class="order-info">
            <span class="order-info-label">Order #:</span>
            <span>${order.id || 'N/A'}</span>
          </div>
          <div class="order-info">
            <span class="order-info-label">Date:</span>
            <span>${orderDate}</span>
          </div>
          ${order.tableNumber ? `
          <div class="order-info">
            <span class="order-info-label">Table:</span>
            <span>${order.tableNumber}</span>
          </div>
          ` : ''}
          ${order.ticketNumber ? `
          <div class="order-info">
            <span class="order-info-label">Ticket:</span>
            <span>${order.ticketNumber}</span>
          </div>
          ` : ''}
          ${order.customerName ? `
          <div class="order-info">
            <span class="order-info-label">Customer:</span>
            <span>${order.customerName}</span>
          </div>
          ` : ''}
          <div class="order-info">
            <span class="order-info-label">Type:</span>
            <span>${orderType === 'dine-in' ? 'Dine-In' : 'Take-Out'}</span>
          </div>
          <div class="order-info">
            <span class="order-info-label">Payment:</span>
            <span class="payment-badge">${paymentMethod === 'gcash' ? 'GCash' : 'Cash'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ITEMS</div>
          <div class="items">
    `;

    (order.items || []).forEach((item) => {
      const itemTotal = (item.totalItemPrice || item.price || 0) * (item.quantity || item.qty || 1);
      html += `
            <div class="item">
              <div class="item-header">
                <span class="item-name">${item.name || 'Unknown Item'}</span>
                <span class="item-qty">x${item.quantity || item.qty || 1}</span>
                <span class="item-price">₱${Number(itemTotal).toFixed(2)}</span>
              </div>
      `;
      
      // Add add-ons
      if (item.addOns && item.addOns.length > 0) {
        item.addOns.forEach((addon) => {
          html += `<div class="addon">+ ${addon.name || 'Add-on'} ${addon.price ? `₱${Number(addon.price).toFixed(2)}` : ''}</div>`;
        });
      }
      
      // Add special instructions
      if (item.specialInstructions) {
        html += `<div class="special-instructions">Note: ${item.specialInstructions}</div>`;
      }
      
      html += `</div>`;
    });

    html += `
          </div>
        </div>

        <div class="section totals">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span>₱${Number(order.subtotal || 0).toFixed(2)}</span>
          </div>
    `;

    if (order.discountAmount && order.discountAmount > 0) {
      html += `
          <div class="total-row">
            <span class="total-label">Discount ${order.discountName ? `(${order.discountName})` : ''}:</span>
            <span>-₱${Number(order.discountAmount || 0).toFixed(2)}</span>
          </div>
      `;
    }

    html += `
          <div class="total-row final">
            <span class="total-label">TOTAL:</span>
            <span>₱${Number(order.total || 0).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your order!</p>
          <p>${paymentMethod === 'gcash' ? 'Payment confirmed via GCash' : 'Cash payment received'}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const handlePrint = async () => {
    try {
      setPrinting(true);
      
      const html = generateReceiptHTML();
      
      const { uri } = await Print.printToFileAsync({
        html,
        width: 300,
        height: undefined,
        base64: false,
      });

      await Print.printAsync({
        uri,
        width: 300,
        height: undefined,
      });

      alertService.success('Success', 'Receipt sent to printer');
    } catch (error) {
      console.error('Print error:', error);
      alertService.error('Print Error', error.message || 'Failed to print receipt. Please try again.');
    } finally {
      setPrinting(false);
    }
  };

  const orderDate = formatDateTime(order.createdAt || order.timestamp || order.paidAt);
  const paymentMethod = order.paymentMethod || 'cash';
  const orderType = order.orderType || 'dine-in';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.md,
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1.5,
        }
      ]}>
        <AnimatedButton
          onPress={handleClose}
          style={{
            backgroundColor: 'transparent',
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.error + '20',
              borderWidth: 1.5,
              borderColor: theme.colors.error + '40',
              padding: spacing.sm,
              borderRadius: borderRadius.round,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              name="close"
              library="ionicons"
              size={22}
              color={theme.colors.error}
              responsive={true}
              hitArea={false}
              style={{ margin: 0 }}
            />
          </View>
        </AnimatedButton>
        <Text style={[
          styles.headerTitle,
          {
            color: theme.colors.text,
            ...typography.h3,
            marginLeft: spacing.md,
            flex: 1,
          }
        ]}>
          Receipt
        </Text>
        <AnimatedButton
          onPress={handlePrint}
          disabled={printing}
          style={{
            backgroundColor: printing ? theme.colors.surfaceVariant : theme.colors.primary,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            minWidth: 100,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {printing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Icon
                name="hourglass"
                library="ionicons"
                size={18}
                color={theme.colors.onPrimary}
                responsive={true}
                hitArea={false}
                style={{ margin: 0 }}
              />
              <Text style={[
                styles.printButtonText,
                {
                  color: theme.colors.onPrimary,
                  ...typography.button,
                }
              ]}>
                Printing...
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Icon
                name="print"
                library="ionicons"
                size={18}
                color={theme.colors.onPrimary}
                responsive={true}
                hitArea={false}
                style={{ margin: 0 }}
              />
              <Text style={[
                styles.printButtonText,
                {
                  color: theme.colors.onPrimary,
                  ...typography.button,
                }
              ]}>
                Print
              </Text>
            </View>
          )}
        </AnimatedButton>
      </View>

      {/* Receipt Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          {
            padding: spacing.lg,
            paddingBottom: spacing.xxl,
          }
        ]}
        showsVerticalScrollIndicator={true}
      >
        {/* Receipt Header */}
        <View style={[
          styles.receiptHeader,
          {
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 2,
            paddingBottom: spacing.md,
            marginBottom: spacing.lg,
            alignItems: 'center',
          }
        ]}>
          <Text style={[
            styles.restaurantName,
            {
              color: theme.colors.text,
              ...typography.h1,
              fontWeight: '900',
              marginBottom: spacing.xs,
              letterSpacing: 1,
            }
          ]}>
            ClickSiLog
          </Text>
          <Text style={[
            styles.restaurantSubtitle,
            {
              color: theme.colors.textSecondary,
              ...typography.caption,
            }
          ]}>
            Restaurant & Ordering System
          </Text>
        </View>

        {/* Order Info */}
        <View style={[
          styles.section,
          {
            marginBottom: spacing.lg,
          }
        ]}>
          <View style={[styles.infoRow, { marginBottom: spacing.xs }]}>
            <Text style={[
              styles.infoLabel,
              {
                color: theme.colors.textSecondary,
                ...typography.body,
                fontWeight: '600',
              }
            ]}>
              Order #:
            </Text>
            <Text style={[
              styles.infoValue,
              {
                color: theme.colors.text,
                ...typography.body,
                fontWeight: '700',
              }
            ]}>
              {order.id || 'N/A'}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginBottom: spacing.xs }]}>
            <Text style={[
              styles.infoLabel,
              {
                color: theme.colors.textSecondary,
                ...typography.body,
                fontWeight: '600',
              }
            ]}>
              Date:
            </Text>
            <Text style={[
              styles.infoValue,
              {
                color: theme.colors.text,
                ...typography.body,
              }
            ]}>
              {orderDate}
            </Text>
          </View>
          {order.tableNumber && (
            <View style={[styles.infoRow, { marginBottom: spacing.xs }]}>
              <Text style={[
                styles.infoLabel,
                {
                  color: theme.colors.textSecondary,
                  ...typography.body,
                  fontWeight: '600',
                }
              ]}>
                Table:
              </Text>
              <Text style={[
                styles.infoValue,
                {
                  color: theme.colors.text,
                  ...typography.body,
                }
              ]}>
                {order.tableNumber}
              </Text>
            </View>
          )}
          {order.ticketNumber && (
            <View style={[styles.infoRow, { marginBottom: spacing.xs }]}>
              <Text style={[
                styles.infoLabel,
                {
                  color: theme.colors.textSecondary,
                  ...typography.body,
                  fontWeight: '600',
                }
              ]}>
                Ticket:
              </Text>
              <Text style={[
                styles.infoValue,
                {
                  color: theme.colors.text,
                  ...typography.body,
                }
              ]}>
                {order.ticketNumber}
              </Text>
            </View>
          )}
          {order.customerName && (
            <View style={[styles.infoRow, { marginBottom: spacing.xs }]}>
              <Text style={[
                styles.infoLabel,
                {
                  color: theme.colors.textSecondary,
                  ...typography.body,
                  fontWeight: '600',
                }
              ]}>
                Customer:
              </Text>
              <Text style={[
                styles.infoValue,
                {
                  color: theme.colors.text,
                  ...typography.body,
                }
              ]}>
                {order.customerName}
              </Text>
            </View>
          )}
          <View style={[styles.infoRow, { marginBottom: spacing.xs }]}>
            <Text style={[
              styles.infoLabel,
              {
                color: theme.colors.textSecondary,
                ...typography.body,
                fontWeight: '600',
              }
            ]}>
              Type:
            </Text>
            <Text style={[
              styles.infoValue,
              {
                color: theme.colors.text,
                ...typography.body,
              }
            ]}>
              {orderType === 'dine-in' ? 'Dine-In' : 'Take-Out'}
            </Text>
          </View>
          <View style={[styles.infoRow]}>
            <Text style={[
              styles.infoLabel,
              {
                color: theme.colors.textSecondary,
                ...typography.body,
                fontWeight: '600',
              }
            ]}>
              Payment:
            </Text>
            <View style={[
              styles.paymentBadge,
              {
                backgroundColor: paymentMethod === 'gcash' ? theme.colors.success + '20' : theme.colors.primary + '20',
                borderColor: paymentMethod === 'gcash' ? theme.colors.success : theme.colors.primary,
                borderRadius: borderRadius.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderWidth: 1.5,
              }
            ]}>
              <Text style={[
                styles.paymentBadgeText,
                {
                  color: paymentMethod === 'gcash' ? theme.colors.success : theme.colors.primary,
                  ...typography.caption,
                  fontWeight: '700',
                }
              ]}>
                {paymentMethod === 'gcash' ? 'GCash' : 'Cash'}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Section */}
        <View style={[
          styles.section,
          {
            marginBottom: spacing.lg,
          }
        ]}>
          <Text style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
              ...typography.h4,
              fontWeight: '800',
              marginBottom: spacing.md,
              borderBottomColor: theme.colors.border,
              borderBottomWidth: 1,
              paddingBottom: spacing.xs,
            }
          ]}>
            ITEMS
          </Text>
          {(order.items || []).map((item, index) => {
            const itemTotal = (item.totalItemPrice || item.price || 0) * (item.quantity || item.qty || 1);
            return (
              <View key={index} style={[
                styles.itemCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }
              ]}>
                <View style={[styles.itemHeader, { marginBottom: spacing.xs }]}>
                  <Text style={[
                    styles.itemName,
                    {
                      color: theme.colors.text,
                      ...typography.bodyBold,
                      flex: 1,
                    }
                  ]}>
                    {item.name || 'Unknown Item'}
                  </Text>
                  <Text style={[
                    styles.itemQty,
                    {
                      color: theme.colors.textSecondary,
                      ...typography.body,
                      marginHorizontal: spacing.sm,
                    }
                  ]}>
                    x{item.quantity || item.qty || 1}
                  </Text>
                  <Text style={[
                    styles.itemPrice,
                    {
                      color: theme.colors.text,
                      ...typography.bodyBold,
                    }
                  ]}>
                    ₱{Number(itemTotal).toFixed(2)}
                  </Text>
                </View>
                {item.addOns && item.addOns.length > 0 && (
                  <View style={{ marginTop: spacing.xs }}>
                    {item.addOns.map((addon, addonIndex) => (
                      <Text key={addonIndex} style={[
                        styles.addonText,
                        {
                          color: theme.colors.textSecondary,
                          ...typography.caption,
                          marginLeft: spacing.md,
                          marginTop: spacing.xs,
                        }
                      ]}>
                        + {addon.name || 'Add-on'}{addon.price ? ` ₱${Number(addon.price).toFixed(2)}` : ''}
                      </Text>
                    ))}
                  </View>
                )}
                {item.specialInstructions && (
                  <Text style={[
                    styles.specialInstructions,
                    {
                      color: theme.colors.textTertiary,
                      ...typography.caption,
                      fontStyle: 'italic',
                      marginLeft: spacing.md,
                      marginTop: spacing.xs,
                    }
                  ]}>
                    Note: {item.specialInstructions}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Totals Section */}
        <View style={[
          styles.totalsSection,
          {
            borderTopColor: theme.colors.border,
            borderTopWidth: 2,
            paddingTop: spacing.md,
            marginTop: spacing.md,
          }
        ]}>
          <View style={[styles.totalRow, { marginBottom: spacing.sm }]}>
            <Text style={[
              styles.totalLabel,
              {
                color: theme.colors.textSecondary,
                ...typography.body,
                fontWeight: '600',
              }
            ]}>
              Subtotal:
            </Text>
            <Text style={[
              styles.totalValue,
              {
                color: theme.colors.text,
                ...typography.body,
              }
            ]}>
              ₱{Number(order.subtotal || 0).toFixed(2)}
            </Text>
          </View>
          {order.discountAmount && order.discountAmount > 0 && (
            <View style={[styles.totalRow, { marginBottom: spacing.sm }]}>
              <Text style={[
                styles.totalLabel,
                {
                  color: theme.colors.textSecondary,
                  ...typography.body,
                  fontWeight: '600',
                }
              ]}>
                Discount{order.discountName ? ` (${order.discountName})` : ''}:
              </Text>
              <Text style={[
                styles.totalValue,
                {
                  color: theme.colors.error,
                  ...typography.body,
                }
              ]}>
                -₱{Number(order.discountAmount || 0).toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[
            styles.totalRow,
            {
              borderTopColor: theme.colors.border,
              borderTopWidth: 1,
              paddingTop: spacing.md,
              marginTop: spacing.xs,
            }
          ]}>
            <Text style={[
              styles.totalLabel,
              {
                color: theme.colors.text,
                ...typography.h3,
                fontWeight: '800',
              }
            ]}>
              TOTAL:
            </Text>
            <Text style={[
              styles.totalValue,
              {
                color: theme.colors.primary,
                ...typography.h2,
                fontWeight: '900',
              }
            ]}>
              ₱{Number(order.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={[
          styles.footer,
          {
            borderTopColor: theme.colors.border,
            borderTopWidth: 2,
            paddingTop: spacing.md,
            marginTop: spacing.xl,
            alignItems: 'center',
          }
        ]}>
          <Text style={[
            styles.footerText,
            {
              color: theme.colors.textSecondary,
              ...typography.body,
              textAlign: 'center',
              marginBottom: spacing.xs,
            }
          ]}>
            Thank you for your order!
          </Text>
          <Text style={[
            styles.footerText,
            {
              color: theme.colors.textTertiary,
              ...typography.caption,
              textAlign: 'center',
            }
          ]}>
            {paymentMethod === 'gcash' ? 'Payment confirmed via GCash' : 'Cash payment received'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  receiptHeader: {
    alignItems: 'center',
  },
  restaurantName: {
    textAlign: 'center',
  },
  restaurantSubtitle: {
    textAlign: 'center',
  },
  section: {
    // Margin handled inline
  },
  sectionTitle: {
    // Typography handled inline
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    // Typography handled inline
  },
  infoValue: {
    // Typography handled inline
    textAlign: 'right',
  },
  paymentBadge: {
    // Styled inline
  },
  paymentBadgeText: {
    // Typography handled inline
  },
  itemCard: {
    // Styled inline
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    // Typography handled inline
  },
  itemQty: {
    // Typography handled inline
  },
  itemPrice: {
    // Typography handled inline
  },
  addonText: {
    // Typography handled inline
  },
  specialInstructions: {
    // Typography handled inline
  },
  totalsSection: {
    // Styled inline
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    // Typography handled inline
  },
  totalValue: {
    // Typography handled inline
    textAlign: 'right',
  },
  footer: {
    // Styled inline
  },
  footerText: {
    // Typography handled inline
  },
  printButtonText: {
    fontWeight: 'bold',
  },
});

export default ReceiptView;

