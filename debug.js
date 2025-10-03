#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function debugDatabase() {
  console.log('🔍 Debugging Database Connection...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check tables
    console.log('\n📊 Checking tables...');
    
    try {
      const usuariosCount = await prisma.usuario.count();
      console.log(`✅ Usuarios table: ${usuariosCount} records`);
    } catch (error) {
      console.log('❌ Usuarios table error:', error.message);
    }
    
    try {
      const balancesCount = await prisma.balance.count();
      console.log(`✅ Balances table: ${balancesCount} records`);
    } catch (error) {
      console.log('❌ Balances table error:', error.message);
    }
    
    try {
      const clientesCount = await prisma.cliente.count();
      console.log(`✅ Clientes table: ${clientesCount} records`);
    } catch (error) {
      console.log('❌ Clientes table error:', error.message);
    }
    
    // Test creating a sample client
    console.log('\n🧪 Testing client creation...');
    try {
      const testClient = await prisma.cliente.create({
        data: {
          rut: '11.111.111-1',
          nombre: 'Test Debug Client',
          direccion: 'Test Address',
          telefono: '+56 9 1234 5678'
        }
      });
      console.log('✅ Test client created:', testClient);
      
      // Clean up
      await prisma.cliente.delete({
        where: { rut: '11.111.111-1' }
      });
      console.log('✅ Test client cleaned up');
    } catch (error) {
      console.log('❌ Client creation error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();