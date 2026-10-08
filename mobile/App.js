import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
  Modal,
  Alert
} from 'react-native';

const INITIAL_BOOKS = [
  { id: '1', title: 'ชีวิตดีขึ้นได้ เริ่มจากตัวเรา', author: 'นภัสสร', price: 199, rating: 4.8, reviews: 120, fileType: 'ไฟล์ PDF (5 MB)', desc: 'แนวคิดและวิธีการพัฒนาตัวเอง ให้มีความสุขมากขึ้น' },
  { id: '2', title: 'เทคนิคการทำงานให้มีประสิทธิภาพ', author: 'ดร. กิตติศักดิ์', price: 159, rating: 4.9, reviews: 95, fileType: 'ไฟล์ PDF (4.8 MB)', desc: 'จัดการเวลา สร้างนิสัยดีๆ เพื่อผลลัพธ์ที่ดีกว่า' },
  { id: '3', title: 'สุขภาพดีเริ่มต้นที่ใจ', author: 'พญ. นิลุบล', price: 129, rating: 4.7, reviews: 78, fileType: 'ไฟล์ PDF (6.1 MB)', desc: 'ดูแลสุขภาพกายและใจ เพื่ออนาคตที่สดใส' },
  { id: '4', title: 'ศิลปะแห่งการใช้ชีวิต', author: 'ก้องภพ', price: 149, rating: 4.8, reviews: 64, fileType: 'ไฟล์ PDF (3.9 MB)', desc: 'ใช้ชีวิตอย่างมีความหมาย และมีความสุขในทุกวัน' }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('home'); // 'home' | 'seller' | 'cart' | 'track' | 'contact'
  const [currentUser, setCurrentUser] = useState({ name: 'ผู้ดูแลระบบ (Admin)', role: 'admin' });
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [cart, setCart] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Seller Form State
  const [sellTitle, setSellTitle] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  const addToCart = (book) => {
    setCart([...cart, book]);
    setSelectedBook(null);
    Alert.alert("สำเร็จ", `เพิ่ม "${book.title}" ลงในตะกร้าแล้ว`);
  };

  const handleSellerSubmit = () => {
    if (!sellTitle || !sellPrice) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อและราคาหนังสือ");
      return;
    }
    const newBook = {
      id: Date.now().toString(),
      title: sellTitle,
      author: currentUser.name,
      price: parseFloat(sellPrice) || 199,
      rating: 5.0,
      reviews: 1,
      fileType: 'ไฟล์ PDF (5 MB)',
      desc: 'ผลงานหนังสือใหม่จากผู้สร้างสรรค์'
    };
    setBooks([newBook, ...books]);
    setSellTitle('');
    setSellPrice('');
    Alert.alert("สำเร็จ!", `วางขาย "${newBook.title}" บนหน้าร้านเรียบร้อยแล้ว`);
    setCurrentTab('home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Mobile Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Text style={styles.headerTitle}>📖 E-Book Shop</Text>
          <Text style={styles.headerSub}>💳 Stripe Secured</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowAuthModal(true)} style={styles.userBadge}>
            <Text style={styles.userBadgeText}>{currentUser.role.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentTab('cart')} style={styles.cartHeaderBtn}>
            <Text style={styles.cartIconText}>🛒</Text>
            {cart.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Body */}
      <View style={styles.body}>
        {currentTab === 'home' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.heroCard}>
              <Text style={styles.heroTag}>💳 Powered by Stripe</Text>
              <Text style={styles.heroTitle}>อ่านได้ทุกที่ ทุกเวลา{'\n'}กับ E-Book ของเรา</Text>
              <Text style={styles.heroSubtitle}>หนังสือดี คุณภาพ ในราคาที่คุณเข้าถึงได้</Text>
              <View style={styles.heroBtnRow}>
                <TouchableOpacity style={styles.heroBtn} onPress={() => setSelectedBook(books[0])}>
                  <Text style={styles.heroBtnText}>เลือกซื้อหนังสือ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.heroBtnSecondary} onPress={() => setCurrentTab('seller')}>
                  <Text style={styles.heroBtnSecondaryText}>+ ลงขายหนังสือ</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>หนังสือแนะนำ & Digital Products</Text>
            {books.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookCard}
                onPress={() => setSelectedBook(book)}
              >
                <View style={styles.bookCover}>
                  <Text style={styles.bookCoverBadge}>PDF</Text>
                </View>
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>{book.author} • ★ {book.rating} ({book.reviews})</Text>
                  <Text style={styles.bookPrice}>฿ {book.price}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {currentTab === 'seller' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.sellerCard}>
              <Text style={styles.trackTitle}>✍️ ศูนย์ลงขายหนังสือ (Creator Hub)</Text>
              <Text style={styles.trackSubtitle}>ลงขายผลงาน รับส่วนแบ่ง 90% ผ่านระบบ Stripe</Text>
              
              <Text style={styles.inputLabel}>ชื่อหนังสือ / Digital Product *</Text>
              <TextInput
                style={styles.input}
                value={sellTitle}
                onChangeText={setSellTitle}
                placeholder="เช่น การพัฒนาตนเองสู่ความสำเร็จ"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.inputLabel}>ราคาขาย (฿) *</Text>
              <TextInput
                style={styles.input}
                value={sellPrice}
                onChangeText={setSellPrice}
                keyboardType="numeric"
                placeholder="เช่น 199"
                placeholderTextColor="#94a3b8"
              />

              <TouchableOpacity style={styles.sellerSubmitBtn} onPress={handleSellerSubmit}>
                <Text style={styles.primaryBtnText}>วางจำหน่ายทันที</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {currentTab === 'track' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.trackCard}>
              <Text style={styles.trackTitle}>ตรวจสอบสถานะคำสั่งซื้อ & ดาวน์โหลด</Text>
              <Text style={styles.trackSubtitle}>กรอกรหัสคำสั่งซื้อเพื่อรับไฟล์ดิจิทัล</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น ORD202509010001"
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>ค้นหาคำสั่งซื้อ</Text>
              </TouchableOpacity>

              <View style={styles.statusSuccessCard}>
                <Text style={styles.statusTag}>PAID • ชำระเงินผ่าน Stripe เรียบร้อย</Text>
                <Text style={styles.emailNotice}>ส่งอีเมลสำเร็จ! ลิงก์ดาวน์โหลดพร้อมใช้งาน</Text>
                <TouchableOpacity style={styles.downloadBtn} onPress={() => Alert.alert("ดาวน์โหลด", "เริ่มดาวน์โหลดไฟล์ PDF เรียบร้อย")}>
                  <Text style={styles.downloadBtnText}>⬇️ ดาวน์โหลดไฟล์ PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {currentTab === 'cart' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>ตะกร้าสินค้า ({cart.length})</Text>
            {cart.length === 0 ? (
              <Text style={styles.emptyText}>ไม่มีสินค้าในตะกร้า</Text>
            ) : (
              <>
                {cart.map((item, index) => (
                  <View key={index} style={styles.cartItem}>
                    <Text style={styles.cartItemTitle}>{item.title}</Text>
                    <Text style={styles.cartItemPrice}>฿ {item.price}</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.stripeCheckoutBtn} onPress={() => Alert.alert("Stripe Checkout", "จำลองชำระเงินผ่าน Stripe สำเร็จ!")}>
                  <Text style={styles.primaryBtnText}>ชำระเงินผ่าน Stripe</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        )}

        {currentTab === 'contact' && (
          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>ติดต่อเรา</Text>
            <Text style={styles.contactText}>📧 support@ebookshop.example.com</Text>
            <Text style={styles.contactText}>💬 LINE Official: @ebookshop</Text>
          </View>
        )}
      </View>

      {/* Auth / Role Switcher Modal */}
      <Modal visible={showAuthModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>สลับบทบาทผู้ใช้งาน (Demo Auth)</Text>
            <TouchableOpacity style={styles.roleBtnAdmin} onPress={() => { setCurrentUser({ name: 'Admin Manager', role: 'admin' }); setShowAuthModal(false); Alert.alert("สลับบทบาท", "เข้าสู่ระบบในฐานะ Admin (จัดการหลังบ้าน)"); }}>
              <Text style={styles.roleBtnTextDark}>🛡️ Admin (จัดการหลังบ้าน)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roleBtnUser} onPress={() => { setCurrentUser({ name: 'สมชาย ผู้ใช้งาน', role: 'user' }); setShowAuthModal(false); Alert.alert("สลับบทบาท", "เข้าสู่ระบบในฐานะ User (ซื้อ & ลงขายได้)"); }}>
              <Text style={styles.roleBtnTextWhite}>👤 User (สามารถทั้งซื้อและลงขายได้)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAuthModal(false)}>
              <Text style={styles.cancelBtnText}>ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Book Detail Modal */}
      <Modal visible={!!selectedBook} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedBook && (
              <>
                <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                <Text style={styles.modalPrice}>฿ {selectedBook.price}</Text>
                <Text style={styles.modalDesc}>{selectedBook.desc}</Text>
                <View style={styles.modalBadgeRow}>
                  <Text style={styles.fileBadge}>📄 {selectedBook.fileType}</Text>
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedBook(null)}>
                    <Text style={styles.cancelBtnText}>ปิด</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyBtn} onPress={() => addToCart(selectedBook)}>
                    <Text style={styles.buyBtnText}>หยิบใส่ตะกร้า</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('home')}>
          <Text style={[styles.tabIcon, currentTab === 'home' && styles.tabActiveText]}>🏠</Text>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabActiveText]}>หน้าร้าน</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('cart')}>
          <Text style={[styles.tabIcon, currentTab === 'cart' && styles.tabActiveText]}>🛒</Text>
          <Text style={[styles.tabLabel, currentTab === 'cart' && styles.tabActiveText]}>ตะกร้า</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('seller')}>
          <Text style={[styles.tabIcon, currentTab === 'seller' && styles.tabActiveText]}>✍️</Text>
          <Text style={[styles.tabLabel, currentTab === 'seller' && styles.tabActiveText]}>ส่งขาย</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('track')}>
          <Text style={[styles.tabIcon, currentTab === 'track' && styles.tabActiveText]}>🕒</Text>
          <Text style={[styles.tabLabel, currentTab === 'track' && styles.tabActiveText]}>ตรวจสถานะ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setCurrentTab('contact')}>
          <Text style={[styles.tabIcon, currentTab === 'contact' && styles.tabActiveText]}>📞</Text>
          <Text style={[styles.tabLabel, currentTab === 'contact' && styles.tabActiveText]}>ติดต่อ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerBrand: { flexDirection: 'column' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  headerSub: { fontSize: 9, color: '#635bff', fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  userBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#78350f' },
  cartHeaderBtn: { padding: 4, position: 'relative' },
  cartIconText: { fontSize: 20 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#2563eb',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  body: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 24 },
  heroCard: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20
  },
  heroTag: { fontSize: 10, fontWeight: 'bold', color: '#dbeafe', marginBottom: 4 },
  heroTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', lineHeight: 24 },
  heroSubtitle: { fontSize: 12, color: '#dbeafe', marginTop: 4 },
  heroBtnRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  heroBtn: { backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  heroBtnText: { color: '#2563eb', fontSize: 12, fontWeight: 'bold' },
  heroBtnSecondary: { backgroundColor: '#4338ca', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  heroBtnSecondaryText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  bookCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  bookCover: {
    width: 44,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bookCoverBadge: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  bookInfo: { flex: 1, marginLeft: 12 },
  bookTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
  bookAuthor: { fontSize: 11, color: '#64748b', marginTop: 2 },
  bookPrice: { fontSize: 14, fontWeight: 'bold', color: '#2563eb', marginTop: 4 },
  chevron: { fontSize: 20, color: '#94a3b8' },
  bottomTabBar: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabButton: { alignItems: 'center' },
  tabIcon: { fontSize: 18 },
  tabLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },
  tabActiveText: { color: '#2563eb', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 8
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  modalPrice: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
  modalDesc: { fontSize: 13, color: '#475569', lineHeight: 18 },
  modalBadgeRow: { marginVertical: 6 },
  fileBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    alignSelf: 'flex-start'
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: { padding: 12, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: 'bold' },
  buyBtn: { flex: 2, padding: 12, backgroundColor: '#2563eb', borderRadius: 12, alignItems: 'center' },
  buyBtnText: { color: '#ffffff', fontWeight: 'bold' },
  roleBtnAdmin: { padding: 12, backgroundColor: '#fbbf24', borderRadius: 12 },
  roleBtnSeller: { padding: 12, backgroundColor: '#6366f1', borderRadius: 12 },
  roleBtnUser: { padding: 12, backgroundColor: '#334155', borderRadius: 12 },
  roleBtnTextDark: { color: '#0f172a', fontWeight: 'bold', textAlign: 'center' },
  roleBtnTextWhite: { color: '#ffffff', fontWeight: 'bold', textAlign: 'center' },
  sellerCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  trackCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  trackTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  trackSubtitle: { fontSize: 12, color: '#64748b', marginVertical: 4 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#334155', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 10, fontSize: 13, marginVertical: 6 },
  primaryBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  sellerSubmitBtn: { backgroundColor: '#4f46e5', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  stripeCheckoutBtn: { backgroundColor: '#635bff', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  statusSuccessCard: { marginTop: 16, padding: 12, backgroundColor: '#ecfdf5', borderRadius: 12, borderWidth: 1, borderColor: '#a7f3d0' },
  statusTag: { color: '#065f46', fontWeight: 'bold', fontSize: 12 },
  emailNotice: { color: '#047857', fontSize: 11, marginTop: 4 },
  downloadBtn: { marginTop: 10, backgroundColor: '#059669', padding: 10, borderRadius: 8, alignItems: 'center' },
  downloadBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginVertical: 20 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 8 },
  cartItemTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
  cartItemPrice: { fontSize: 13, fontWeight: 'bold', color: '#2563eb' },
  contactContainer: { padding: 16 },
  contactText: { fontSize: 13, color: '#334155', marginBottom: 8 }
});
