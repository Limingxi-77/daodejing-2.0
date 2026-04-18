// 数据同步功能测试脚本
import { dataSyncService } from './src/services/dataSyncService.ts';

// 模拟用户ID
const userId = 'test-user-123';

// 测试数据同步功能
async function testDataSync() {
  console.log('开始测试数据同步功能...');
  
  // 1. 测试学习进度同步
  console.log('\n测试学习进度同步...');
  try {
    const syncResult = await dataSyncService.syncLearningProgress(userId, 'beginner', '1', 50);
    console.log('学习进度同步结果:', syncResult);
  } catch (error) {
    console.error('学习进度同步失败:', error);
  }
  
  // 2. 测试学习目标同步
  console.log('\n测试学习目标同步...');
  try {
    const goals = [
      { text: '每天学习30分钟', targetDate: new Date().toISOString(), completed: false, createdAt: new Date().toISOString() },
      { text: '完成初学者路径', targetDate: new Date().toISOString(), completed: false, createdAt: new Date().toISOString() }
    ];
    const syncResult = await dataSyncService.syncLearningGoals(userId, goals);
    console.log('学习目标同步结果:', syncResult);
  } catch (error) {
    console.error('学习目标同步失败:', error);
  }
  
  // 3. 测试学习统计同步
  console.log('\n测试学习统计同步...');
  try {
    const stats = {
      totalStudyTime: 3600,
      completedLessons: 5,
      streakDays: 3,
      lastStudyDate: new Date().toISOString()
    };
    const syncResult = await dataSyncService.syncLearningStats(userId, stats);
    console.log('学习统计同步结果:', syncResult);
  } catch (error) {
    console.error('学习统计同步失败:', error);
  }
  
  // 4. 测试学习记录同步
  console.log('\n测试学习记录同步...');
  try {
    const record = {
      courseId: 'beginner',
      chapterId: '1',
      studyTime: 15,
      completed: false,
      timestamp: new Date().toISOString()
    };
    const syncResult = await dataSyncService.syncStudyRecord(userId, record);
    console.log('学习记录同步结果:', syncResult);
  } catch (error) {
    console.error('学习记录同步失败:', error);
  }
  
  // 5. 测试用户笔记同步
  console.log('\n测试用户笔记同步...');
  try {
    const note = {
      content: '这是一条测试笔记',
      chapterId: 1,
      tags: ['测试', '笔记'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const syncResult = await dataSyncService.syncUserNote(userId, note);
    console.log('用户笔记同步结果:', syncResult);
  } catch (error) {
    console.error('用户笔记同步失败:', error);
  }
  
  // 6. 测试对话历史同步
  console.log('\n测试对话历史同步...');
  try {
    const conversation = {
      title: '测试对话',
      messages: [
        { role: 'user', content: '你好' },
        { role: 'assistant', content: '您好，有什么可以帮助您的？' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const syncResult = await dataSyncService.syncConversation(userId, conversation);
    console.log('对话历史同步结果:', syncResult);
  } catch (error) {
    console.error('对话历史同步失败:', error);
  }
  
  // 7. 测试社区点赞同步
  console.log('\n测试社区点赞同步...');
  try {
    const syncResult = await dataSyncService.syncCommunityLike(userId, 'post-123', true);
    console.log('社区点赞同步结果:', syncResult);
  } catch (error) {
    console.error('社区点赞同步失败:', error);
  }
  
  // 8. 测试社区书签同步
  console.log('\n测试社区书签同步...');
  try {
    const syncResult = await dataSyncService.syncCommunityBookmark(userId, 'post-123', true);
    console.log('社区书签同步结果:', syncResult);
  } catch (error) {
    console.error('社区书签同步失败:', error);
  }
  
  // 9. 测试社区关注同步
  console.log('\n测试社区关注同步...');
  try {
    const syncResult = await dataSyncService.syncCommunityFollow(userId, 'user-456', true);
    console.log('社区关注同步结果:', syncResult);
  } catch (error) {
    console.error('社区关注同步失败:', error);
  }
  
  // 10. 测试社区草稿同步
  console.log('\n测试社区草稿同步...');
  try {
    const draft = {
      content: '这是一条测试草稿',
      title: '测试草稿',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const syncResult = await dataSyncService.syncCommunityDraft(userId, draft);
    console.log('社区草稿同步结果:', syncResult);
  } catch (error) {
    console.error('社区草稿同步失败:', error);
  }
  
  // 11. 测试修炼数据同步
  console.log('\n测试修炼数据同步...');
  try {
    const syncResult = await dataSyncService.syncCultivationData(userId, 100);
    console.log('修炼数据同步结果:', syncResult);
  } catch (error) {
    console.error('修炼数据同步失败:', error);
  }
  
  // 12. 测试从 Supabase 同步数据到 LocalStorage
  console.log('\n测试从 Supabase 同步数据到 LocalStorage...');
  try {
    const syncResult = await dataSyncService.syncFromSupabase(userId);
    console.log('从 Supabase 同步数据结果:', syncResult);
  } catch (error) {
    console.error('从 Supabase 同步数据失败:', error);
  }
  
  console.log('\n数据同步功能测试完成！');
}

// 运行测试
testDataSync();
